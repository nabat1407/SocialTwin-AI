import { describe, expect, it } from 'vitest';
import { fixtureOpportunities, scenarios } from '../src/lib/fixtures';
import { availability, isRecommendable, matchFixtures, scoreRows } from '../src/lib/scoring';
import { fixtureDraft, validateClaimReferences } from '../src/lib/package';
import { profileSchema, type Profile } from '../src/lib/schemas';

function profile(): Profile {
  return {
    id: 'p1',
    revision: 1,
    locale: 'az',
    ...scenarios[0].draft,
    skills: [...scenarios[0].draft.skills],
    missing_information: [...scenarios[0].draft.missing_information],
    claims: scenarios[0].draft.claims.map((text, i) => ({
      id: `c${i}`,
      text,
      user_approved: i !== 2,
    })),
    confirmed_at: '2026-10-09T10:00:00.000Z',
  };
}
describe('explainable scoring and deadlines', () => {
  it('retains unknown in denominator without calling it unmet', () => {
    const match = matchFixtures(profile(), fixtureOpportunities)[0];
    expect(match.opportunity.id).toBe('demo-ai');
    expect(match.met).toBe(3);
    expect(match.unknown).toBe(2);
    expect(match.readiness).toBe(60);
  });
  it('blocks critical eligibility even with a high readiness score', () => {
    const opportunity = fixtureOpportunities[0];
    const rows = opportunity.requirements.map((r) => ({
      requirement_id: r.id,
      status: r.kind === 'eligibility' ? ('unmet' as const) : ('met' as const),
      rationale: 'Explicit test evidence',
      profile_field_refs: [],
    }));
    const result = scoreRows(opportunity, rows);
    expect(result.readiness).toBe(80);
    expect(result.eligibility).toBe('ineligible');
  });
  it('rejects invented or duplicated requirement IDs', () => {
    expect(() =>
      scoreRows(fixtureOpportunities[0], [
        {
          requirement_id: 'invented',
          status: 'met',
          rationale: 'Invalid identifier',
          profile_field_refs: [],
        },
      ]),
    ).toThrow();
  });
  it('handles zero requirements without a fabricated percentage', () => {
    expect(scoreRows({ ...fixtureOpportunities[0], requirements: [] }, []).readiness).toBeNull();
  });
  it('makes date-only cutoff day uncertain in Baku time', () => {
    const opportunity = {
      ...fixtureOpportunities[0],
      deadline: { kind: 'fixed_date' as const, date: '2026-10-10' },
    };
    expect(availability(opportunity, new Date('2026-10-09T21:00:00Z'))).toBe('uncertain');
    expect(availability(opportunity, new Date('2026-10-11T00:00:00Z'))).toBe('expired');
  });
  it('never recommends fixtures as verified live opportunities', () => {
    expect(
      isRecommendable(
        {
          ...fixtureOpportunities[0],
          verification_status: 'verified',
          verified_at: '2026-10-09T10:00:00Z',
          source_url: 'https://example.org',
        },
        new Date('2026-10-09T11:00:00Z'),
      ),
    ).toBe(false);
  });
  it('keeps self-reported missing skills unknown rather than absent', () => {
    const match = matchFixtures({ ...profile(), skills: [] }, fixtureOpportunities).find(
      (m) => m.opportunity.id === 'demo-ai',
    )!;
    expect(match.rows.find((r) => r.requirement_id === 'ai-python')?.status).toBe('unknown');
  });
});
describe('approved claim boundary', () => {
  it('does not put rejected claims into a generated document', () => {
    const draft = fixtureDraft(profile(), false);
    expect(draft.resume.flatMap((e) => e.claim_ids)).not.toContain('c2');
    expect(draft.letter).toEqual([]);
  });
  it('rejects a reference to an unapproved or invented claim', () => {
    const draft = fixtureDraft(profile(), false);
    draft.resume[0].claim_ids = ['c2'];
    expect(() => validateClaimReferences(draft, profile(), false)).toThrow();
  });
  it('requires distinct claim IDs', () => {
    const p = profile();
    p.claims[1].id = p.claims[0].id;
    expect(profileSchema.safeParse(p).success).toBe(false);
  });
  it('does not invent learned SQL mastery in career-change fixture', () => {
    expect(scenarios[2].draft.skills).not.toContain('SQL');
  });
});
