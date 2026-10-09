import { describe, expect, it } from 'vitest';
import { catalogSchema, deadlineSchema, opportunitySchema } from '../src/lib/catalog-schema';
import { fixtureOpportunities, scenarios } from '../src/lib/fixtures';
import { formatDocument, exportText } from '../src/lib/documents';
import { fixtureDraft, validateClaimReferences } from '../src/lib/package';
import {
  availability,
  isRecommendable,
  scoreRows,
  validateProfileReferences,
} from '../src/lib/scoring';
import {
  extractionSchema,
  profileSchema,
  type Profile,
  type ComparisonRow,
  type Package,
} from '../src/lib/schemas';

const p: Profile = {
  id: 'test-profile',
  revision: 3,
  locale: 'az',
  name: '',
  target_role: null,
  education: '',
  skills: [],
  missing_information: [],
  confirmed_at: '2026-10-09T10:00:00Z',
  claims: [
    ...[1, 2, 3, 4].map((i) => ({ id: `c${i}`, text: `Nümunə təcrübə ${i}`, user_approved: true })),
    { id: 'rejected', text: 'Rejected example', user_approved: false },
  ],
};
const o = {
  ...fixtureOpportunities[0],
  fixture: false,
  verification_status: 'verified' as const,
  verified_at: '2026-10-09T10:00:00Z',
  source_url: 'https://example.org',
  deadline: { kind: 'rolling' as const, date: null },
};
const now = new Date('2026-10-09T11:00:00Z');

describe('runtime contracts', () => {
  it('allows an unknown target role without inventing one', () => {
    expect(profileSchema.parse(p).target_role).toBeNull();
    expect(
      extractionSchema.parse({ ...scenarios[0].draft, target_role: null }).target_role,
    ).toBeNull();
  });
  it('rejects unsupported locale, oversized profile and unknown fields', () => {
    expect(profileSchema.safeParse({ ...p, locale: 'fr' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...p, education: 'x'.repeat(1001) }).success).toBe(false);
    expect(profileSchema.safeParse({ ...p, secret: 'extra' }).success).toBe(false);
  });
  it('rejects fictional records in the live catalog', () => {
    expect(catalogSchema.parse([])).toEqual([]);
    expect(opportunitySchema.safeParse(fixtureOpportunities[0]).success).toBe(false);
  });
  it('requires sourced, unique, typed catalog requirements', () => {
    const record = {
      ...o,
      work_mode: 'hybrid',
      source_excerpt: 'Synthetic validation data',
      catalog_version: 'test-v1',
      deadline: { kind: 'rolling', date: null, source_text: 'Rolling applications' },
      requirements: o.requirements.map((r) => ({
        ...r,
        source_locator: 'Test requirements section',
      })),
    };
    expect(opportunitySchema.safeParse(record).success).toBe(true);
    expect(catalogSchema.safeParse([record, record]).success).toBe(false);
    expect(
      opportunitySchema.safeParse({ ...record, source_url: 'javascript:alert(1)' }).success,
    ).toBe(false);
    expect(
      opportunitySchema.safeParse({
        ...record,
        requirements: [record.requirements[0], record.requirements[0]],
      }).success,
    ).toBe(false);
  });
  it('rejects impossible dates and inconsistent datetime cutoffs', () => {
    expect(
      deadlineSchema.safeParse({ kind: 'fixed_date', date: '2026-02-30', source_text: 'Invalid' })
        .success,
    ).toBe(false);
    const cutoff = {
      kind: 'fixed_datetime',
      date: '2026-10-10',
      time: '18:00:00',
      timezone: 'Asia/Baku',
      instant: '2026-10-10T14:00:00Z',
      source_text: '10 October, 18:00 Baku',
    };
    expect(deadlineSchema.safeParse(cutoff).success).toBe(true);
    expect(deadlineSchema.safeParse({ ...cutoff, instant: '2026-10-10T15:00:00Z' }).success).toBe(
      false,
    );
    expect(deadlineSchema.safeParse({ ...cutoff, timezone: 'Invalid/Zone' }).success).toBe(false);
  });
});

describe('freshness, coverage and attribution gates', () => {
  it('excludes stale, pending, future-verified and unknown-deadline records', () => {
    expect(isRecommendable(o, now)).toBe(true);
    expect(isRecommendable({ ...o, verified_at: '2026-10-07T10:00:00Z' }, now)).toBe(false);
    expect(isRecommendable({ ...o, verified_at: '2026-10-10T10:00:00Z' }, now)).toBe(false);
    expect(isRecommendable({ ...o, verification_status: 'pending' }, now)).toBe(false);
    expect(isRecommendable({ ...o, deadline: { kind: 'unknown', date: null } }, now)).toBe(false);
  });
  it('applies the shorter freshness window close to a fixed cutoff', () => {
    expect(
      isRecommendable(
        {
          ...o,
          deadline: { kind: 'fixed_date', date: '2026-10-11' },
          verified_at: '2026-10-07T10:00:00Z',
        },
        now,
      ),
    ).toBe(false);
    expect(
      isRecommendable(
        {
          ...o,
          deadline: { kind: 'fixed_date', date: '2026-10-20' },
          verified_at: '2026-10-07T10:00:00Z',
        },
        now,
      ),
    ).toBe(true);
    expect(
      isRecommendable(
        {
          ...o,
          deadline: { kind: 'fixed_datetime', date: '2026-10-11', instant: '2026-10-11T10:00:00Z' },
          verified_at: '2026-10-07T10:00:00Z',
        },
        now,
      ),
    ).toBe(false);
  });
  it('treats an exact instant cutoff as expired and malformed dates as uncertain', () => {
    expect(
      availability(
        {
          ...o,
          deadline: { kind: 'fixed_datetime', date: '2026-10-09', instant: now.toISOString() },
        },
        now,
      ),
    ).toBe('expired');
    expect(availability({ ...o, deadline: { kind: 'fixed_date', date: '2026-02-30' } }, now)).toBe(
      'uncertain',
    );
  });
  it('keeps mandatory missing skills distinct from eligibility', () => {
    const rows: ComparisonRow[] = o.requirements.map((r) => ({
      requirement_id: r.id,
      status: r.id === 'ai-python' ? 'unmet' : 'met',
      rationale: 'Test fact',
      profile_field_refs: [],
    }));
    const result = scoreRows(o, rows);
    expect(result.eligibility).toBe('eligible');
    expect(result.blocking_requirement_ids).toEqual(['ai-python']);
    expect(result.unmet).toBe(1);
    expect(result.evidence_coverage).toBe(100);
    expect(() => scoreRows(o, [...rows.slice(1), rows[1]])).toThrow();
  });
  it('rejects unsupported met claims, nonexistent fields and rejected references', () => {
    const row: ComparisonRow = {
      requirement_id: 'test',
      status: 'met',
      rationale: 'Test fact',
      profile_field_refs: [],
    };
    expect(() => validateProfileReferences([row], p)).toThrow();
    expect(() =>
      validateProfileReferences([{ ...row, profile_field_refs: ['skills.99'] }], p),
    ).toThrow();
    expect(() =>
      validateProfileReferences([{ ...row, profile_field_refs: ['claims.rejected'] }], p),
    ).toThrow();
    expect(
      validateProfileReferences([{ ...row, profile_field_refs: ['claims.c1'] }], p),
    ).toHaveLength(1);
  });
});

describe('editable output boundaries', () => {
  it('provides a short resume and a more complete CV, excluding rejected claims from both', () => {
    const draft = fixtureDraft(p, false);
    expect(draft.resume).toHaveLength(3);
    expect(draft.cv).toHaveLength(4);
    expect(JSON.stringify(draft)).not.toContain('Rejected example');
    expect(draft.action_plan.at(-1)?.deliverable).not.toContain('son tarixi');
  });
  it('validates CV and letter references as well as resume references', () => {
    const draft = fixtureDraft(p, false);
    draft.cv[0].claim_ids = ['rejected'];
    expect(() => validateClaimReferences(draft, p, false)).toThrow();
    expect(() => validateClaimReferences(fixtureDraft(p, false), p, true)).toThrow();
  });
  it('preserves AZ characters and demo provenance on export; rejects obsolete packages', () => {
    const pack: Package = {
      draft: fixtureDraft(p, false),
      mode: 'fixture',
      opportunity_id: null,
      opportunity_name: null,
      profile_revision: p.revision,
    };
    const document = formatDocument(p, pack, 'cv');
    expect(document).toContain('Nümunə təcrübə');
    expect(exportText(pack, document)).toMatch(/^DEMO \/ NÜMUNƏ/);
    expect(formatDocument(p, pack, 'letter')).toBe('');
    expect(() => formatDocument({ ...p, revision: p.revision + 1 }, pack, 'cv')).toThrow(
      'Stale package',
    );
  });
});
