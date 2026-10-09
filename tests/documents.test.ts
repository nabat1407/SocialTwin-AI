import { describe, expect, it } from 'vitest';
import { formatDocument, exportText } from '../src/lib/documents';
import { fixtureDraft, validateClaimReferences } from '../src/lib/package';
import { availability, validateProfileReferences } from '../src/lib/scoring';
import { fixtureOpportunities } from '../src/lib/fixtures';
import type { Package, Profile } from '../src/lib/schemas';

const profile: Profile = {
  id: 'p',
  revision: 2,
  locale: 'en',
  name: 'Test Candidate',
  target_role: null,
  education: '',
  skills: [],
  missing_information: [],
  claims: Array.from({ length: 4 }, (_, i) => ({
    id: `c${i}`,
    text: `Approved experience ${i}`,
    user_approved: true,
  })),
  confirmed_at: '2026-10-09T10:00:00.000Z',
};
const pack: Package = {
  mode: 'fixture',
  draft: fixtureDraft(profile, false),
  opportunity_name: null,
  opportunity_id: null,
  profile_revision: 2,
};
describe('documents and source boundaries', () => {
  it('does not turn a generic career goal into a professional job title', () => {
    for (const goal of [
      'İş və təcrübə',
      'Junior proqramçı işi və təcrübə proqramları',
      'Proqramlaşdırma üzrə təcrübə proqramı',
    ])
      expect(formatDocument({ ...profile, target_role: goal }, pack, 'cv')).not.toContain(goal);
    expect(formatDocument({ ...profile, target_role: 'Software Engineer' }, pack, 'cv')).toContain(
      'Software Engineer',
    );
  });
  it('sorts a fully dated section newest first without guessing dates for undated entries', () => {
    const entries = [
      { text: 'Project in 2023', section: 'projects' as const, claim_ids: ['c0'] },
      { text: 'Project in 2025', section: 'projects' as const, claim_ids: ['c1'] },
    ];
    const dated = formatDocument(profile, { ...pack, draft: { ...pack.draft, cv: entries } }, 'cv');
    expect(dated.indexOf('2025')).toBeLessThan(dated.indexOf('2023'));
    const mixed = formatDocument(
      profile,
      {
        ...pack,
        draft: { ...pack.draft, cv: [entries[0], { ...entries[1], text: 'Undated project' }] },
      },
      'cv',
    );
    expect(mixed.indexOf('2023')).toBeLessThan(mixed.indexOf('Undated'));
  });
  it('formats the existing action plan as an editable document in the selected language', () => {
    const text = formatDocument(profile, pack, 'plan');
    expect(text).toContain('PREPARATION PLAN');
    expect(text).toContain(pack.draft.action_plan[0].title);
    expect(text).toContain(
      `Estimated time: ${pack.draft.action_plan[0].estimated_minutes} minutes`,
    );
  });
  it('groups approved facts into professional sections without empty or invented content', () => {
    const professional: Package = {
      ...pack,
      draft: {
        ...pack.draft,
        resume: [
          { text: 'BSc Computer Science · 2024–present', section: 'education', claim_ids: ['c0'] },
          {
            text: 'Implemented a Python API for a course project.',
            section: 'projects',
            claim_ids: ['c1'],
          },
          { text: 'Python, SQL', section: 'skills', claim_ids: ['c2'] },
        ],
      },
    };
    const output = formatDocument(
      { ...profile, contact: { email: 'candidate@example.test', phone: '', website: '' } },
      professional,
      'resume',
    );
    expect(output).toContain('candidate@example.test');
    expect(output).toContain('EDUCATION\nBSc');
    expect(output).toContain('PROJECTS\n• Implemented');
    expect(output).toContain('SKILLS\n• Python, SQL');
    expect(output).not.toContain('AWARDS');
    expect(output).not.toMatch(/expert|senior|increased|years of experience/i);
  });
  it('renders the catalog organisation greeting without altering candidate statements', () => {
    const text = formatDocument(
      { ...profile, locale: 'az' },
      {
        ...pack,
        opportunity_organization: 'CERN',
        draft: {
          ...pack.draft,
          letter: [
            {
              text: 'Hörmətli CERN seçىم komissiyası, Python ilə layihə hazırlamışam.',
              claim_ids: ['c0'],
            },
          ],
        },
      },
      'letter',
    );
    expect(text).toBe(
      'Test Candidate\n\nHörmətli CERN komandası,\n\nPython ilə layihə hazırlamışam.',
    );
  });
  it('keeps the fuller CV distinct from a concise resume', () => {
    expect(formatDocument(profile, pack, 'cv')).toContain('Approved experience 3');
    expect(formatDocument(profile, pack, 'resume')).not.toContain('Approved experience 3');
  });
  it('rejects a document from a previous profile revision', () => {
    expect(() => formatDocument({ ...profile, revision: 3 }, pack, 'cv')).toThrow('Stale package');
  });
  it('labels fixture exports so files cannot pass as live AI output', () => {
    expect(exportText(pack, 'Text')).toMatch(/^DEMO \/ NÜMUNƏ/);
  });
  it('rejects invented references in the CV as well as the resume', () => {
    const draft = fixtureDraft(profile, false);
    draft.cv[0].claim_ids = ['invented'];
    expect(() => validateClaimReferences(draft, profile, false)).toThrow();
  });
  it('rejects invented impact metrics even when a real approved claim ID is cited', () => {
    const draft = fixtureDraft(profile, false);
    draft.resume[0].text = 'Improved response time by 87%.';
    expect(() => validateClaimReferences(draft, profile, false)).toThrow(
      'Unsupported numeric document fact',
    );
  });
  it('rejects a met requirement without supporting profile evidence', () => {
    expect(() =>
      validateProfileReferences(
        [
          {
            requirement_id: 'req',
            status: 'met',
            rationale: 'Unsupported',
            profile_field_refs: [],
          },
        ],
        profile,
      ),
    ).toThrow();
  });
  it('treats an impossible calendar date as unknown', () => {
    expect(
      availability(
        { ...fixtureOpportunities[0], deadline: { kind: 'fixed_date', date: '2026-02-30' } },
        new Date('2026-01-01T00:00:00Z'),
      ),
    ).toBe('uncertain');
  });
});
