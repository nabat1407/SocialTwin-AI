import { afterEach, describe, expect, it, vi } from 'vitest';
import { catalogSchema } from '../src/lib/catalog-schema';
import data from '../data/opportunities.json';
import type { Profile, ComparisonRow } from '../src/lib/schemas';
import { scoreRows } from '../src/lib/scoring';
import {
  activeCatalog,
  matchCatalog,
  validateComparisons,
  rankMatches,
  clarifyUnsupportedNegatives,
} from '../src/lib/server/matching';

vi.mock('server-only', () => ({}));
const { structured } = vi.hoisted(() => ({ structured: vi.fn() }));
vi.mock('../src/lib/server/gemini', () => ({ structured }));
afterEach(() => {
  vi.useRealTimers();
  structured.mockReset();
});
const profile: Profile = {
  id: 'test',
  revision: 1,
  locale: 'az',
  name: '',
  education: 'CS tələbəsi',
  skills: ['Python'],
  interests: ['Süni intellekt'],
  languages: ['İngilis B2'],
  target_role: null,
  missing_information: [],
  confirmed_at: '2026-10-09T09:20:00Z',
  claims: [
    { id: 'fact', text: 'Sintetik istifadəçi bəyanı.', user_approved: true },
    { id: 'rejected', text: 'Rədd edilən bəyan', user_approved: false },
  ],
};
const catalog = catalogSchema.parse(data);
const rows = (i = 0): ComparisonRow[] =>
  catalog[i].requirements.map((r) => ({
    requirement_id: r.id,
    status: 'unknown',
    rationale: 'Məlumat yoxdur.',
    profile_field_refs: [],
  }));

describe('verified matching contracts', () => {
  it('contains sourced records for all four requested types and timezones agree', () => {
    expect(new Set(catalog.map((o) => o.category))).toEqual(
      new Set(['job', 'scholarship', 'grant', 'internship']),
    );
    expect(activeCatalog(new Date('2026-10-09T12:00:00Z'))).toHaveLength(9);
    expect(activeCatalog(new Date('2030-01-01'))).toEqual([]);
  });
  it('rejects missing, duplicated and invented opportunity/requirement IDs', () => {
    const item = { opportunity_id: catalog[0].id, rows: rows() };
    expect(() => validateComparisons({ comparisons: [] }, [catalog[0]], profile)).toThrow();
    expect(() =>
      validateComparisons({ comparisons: [item, item] }, [catalog[0], catalog[1]], profile),
    ).toThrow();
    expect(() =>
      validateComparisons(
        { comparisons: [{ ...item, opportunity_id: 'invented' }] },
        [catalog[0]],
        profile,
      ),
    ).toThrow();
    expect(() =>
      validateComparisons(
        { comparisons: [{ ...item, rows: rows().slice(1) }] },
        [catalog[0]],
        profile,
      ),
    ).toThrow();
    expect(() =>
      validateComparisons(
        {
          comparisons: [
            { ...item, rows: [{ ...rows()[0], requirement_id: 'invented' }, ...rows().slice(1)] },
          ],
        },
        [catalog[0]],
        profile,
      ),
    ).toThrow();
  });
  it.each(['met', 'unmet'] as const)(
    'requires approved/existing references for %s, keeps missing as unknown',
    (status) => {
      const check = (refs: string[]) =>
        validateComparisons(
          {
            comparisons: [
              {
                opportunity_id: catalog[0].id,
                rows: [{ ...rows()[0], status, profile_field_refs: refs }, ...rows().slice(1)],
              },
            ],
          },
          [catalog[0]],
          profile,
        );
      expect(() => check([])).toThrow();
      expect(() => check(['claims.rejected'])).toThrow();
      expect(() => check(['languages.99'])).toThrow();
      expect(() => check(['claims.fact'])).not.toThrow();
    },
  );
  it('computes the percentage from requirements and keeps eligibility separate', () => {
    const comparison = rows().map((row, i) => ({
      ...row,
      status: i === 0 ? ('unmet' as const) : ('met' as const),
      profile_field_refs: ['claims.fact'],
    }));
    const score = scoreRows(catalog[0], comparison);
    expect(score.readiness).toBe(Math.round((8 / 9) * 100));
    expect(score.eligibility).toBe('ineligible');
    expect(score.blocking_requirement_ids).toContain(catalog[0].requirements[0].id);
  });
  it('rejects interest alone as evidence of an eligibility/skill requirement', () => {
    expect(() =>
      validateComparisons(
        {
          comparisons: [
            {
              opportunity_id: catalog[3].id,
              rows: rows(3).map((row, i) =>
                i === 3 ? { ...row, status: 'met', profile_field_refs: ['interests.0'] } : row,
              ),
            },
          ],
        },
        [catalog[3]],
        profile,
      ),
    ).toThrow('Interest is not qualification evidence');
  });
  it('does not turn student status or missing data into a negative eligibility fact', () => {
    const negative: ComparisonRow[] = [
      {
        requirement_id: 'test',
        status: 'unmet',
        rationale: 'Unsupported inference',
        profile_field_refs: ['education'],
      },
    ];
    expect(clarifyUnsupportedNegatives(negative, profile)[0].status).toBe('unknown');
    const explicit = {
      ...profile,
      claims: [{ id: 'fact', text: 'Şirkətim yoxdur.', user_approved: true }],
    };
    expect(
      clarifyUnsupportedNegatives(
        [{ ...negative[0], profile_field_refs: ['claims.fact'] }],
        explicit,
      )[0].status,
    ).toBe('unmet');
  });
  it('preserves an explicit citizenship barrier against the sourced country list', () => {
    const candidate = { ...profile, eligibility_notes: 'Azərbaycan vətəndaşıyam.' };
    const negative: ComparisonRow[] = [
      {
        requirement_id: 'ts-nationality',
        status: 'unmet',
        rationale: 'Country outside the supplied list',
        profile_field_refs: ['eligibility_notes'],
      },
    ];
    expect(clarifyUnsupportedNegatives(negative, candidate, catalog[0])[0].status).toBe('unmet');
  });
  it('does not reuse an unrelated denial from a multi-sentence eligibility field', () => {
    const candidate = {
      ...profile,
      eligibility_notes: 'PhD təhsilim yoxdur. Mən tələbəyəm.',
    };
    const negative: ComparisonRow[] = [
      {
        requirement_id: catalog[3].requirements[0].id,
        status: 'unmet',
        rationale: 'Unsupported company inference',
        profile_field_refs: ['eligibility_notes'],
      },
    ];
    expect(clarifyUnsupportedNegatives(negative, candidate, catalog[3])[0].status).toBe('unknown');
    expect(
      clarifyUnsupportedNegatives(
        negative,
        {
          ...candidate,
          eligibility_notes: 'Şirkətim yoxdur.',
        },
        catalog[3],
      )[0].status,
    ).toBe('unmet');
  });
  it('uses interests only as a tie-break and eligible candidates rank before uncertain ones', () => {
    const base = { ...scoreRows(catalog[0], rows()), readiness: 50 };
    const a = { ...base, opportunity: catalog[0], eligibility: 'eligible' as const };
    const b = { ...base, opportunity: catalog[3], eligibility: 'eligible' as const };
    expect(rankMatches([a, b], profile)[0].opportunity.id).toBe(catalog[3].id);
    expect(
      rankMatches([{ ...a, readiness: 100, eligibility: 'needs_clarification' }, b], profile)[0]
        .opportunity.id,
    ).toBe(b.opportunity.id);
  });
  it('excludes expired catalog without a provider call', async () => {
    vi.setSystemTime(new Date('2030-01-01T12:00:00Z'));
    expect((await matchCatalog(profile)).matches).toEqual([]);
    expect(structured).not.toHaveBeenCalled();
  });
  it('compares only selected categories and never exposes an ineligible match as recommended', async () => {
    vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
    structured.mockImplementation(async (_task, _prompt, sent) => ({
      comparisons: sent.opportunities.map((o: { id: string }) => ({
        opportunity_id: o.id,
        rows: rows(catalog.findIndex((item) => item.id === o.id)).map((row, i) =>
          o.id === catalog[3].id && i === 0
            ? { ...row, status: 'unmet', profile_field_refs: ['claims.fact'] }
            : row,
        ),
      })),
    }));
    const result = await matchCatalog({
      ...profile,
      claims: [
        { id: 'fact', text: 'Şirkətim yoxdur.', user_approved: true },
        ...profile.claims.slice(1),
      ],
      opportunity_types: ['grant'],
    });
    expect(result.matches).toHaveLength(2);
    expect(result.excluded_matches).toHaveLength(1);
    const sent = structured.mock.calls[0][2];
    expect(sent.opportunities).toHaveLength(3);
    expect(
      sent.profile_sources.some((source: { ref: string }) => source.ref === 'claims.rejected'),
    ).toBe(false);
  });
  it('analyzes all nine records in bounded batches; reports a failed batch without fake scores', async () => {
    vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
    structured.mockImplementation(async (_task, _prompt, sent) => {
      if (sent.opportunities.some((o: { id: string }) => o.id === catalog[6].id))
        throw new Error('Provider outage');
      return {
        comparisons: sent.opportunities.map((o: { id: string }) => ({
          opportunity_id: o.id,
          rows: rows(catalog.findIndex((item) => item.id === o.id)),
        })),
      };
    });
    const result = await matchCatalog(profile);
    expect(structured).toHaveBeenCalledTimes(4);
    expect(structured.mock.calls.every((call) => call[2].opportunities.length <= 3)).toBe(true);
    expect(result.matches).toHaveLength(6);
    expect(result.failed_opportunity_ids).toHaveLength(3);
    expect(result.warnings).toHaveLength(1);
    expect(result.catalog_count).toBe(9);
  });
  it('propagates failure if no batch could be compared', async () => {
    vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
    structured.mockRejectedValue(new Error('Unavailable'));
    await expect(matchCatalog(profile)).rejects.toThrow('Unavailable');
  });
});
