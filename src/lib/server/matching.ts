import 'server-only';
import { z } from 'zod';
import catalogData from '../../../data/opportunities.json';
import { catalogSchema } from '../catalog-schema';
import { comparisonRowSchema, type Opportunity, type Profile, type Match } from '../schemas';
import { isRecommendable, scoreRows, validateProfileReferences } from '../scoring';
import { structured } from './gemini';
import { RequestError } from './http';

const analysisSchema = z
  .object({
    comparisons: z
      .array(
        z
          .object({
            opportunity_id: z.string().min(1).max(100),
            rows: z.array(comparisonRowSchema).min(1).max(40),
          })
          .strict(),
      )
      .max(8),
  })
  .strict();

export function activeCatalog(now = new Date()): Opportunity[] {
  return catalogSchema
    .parse(catalogData)
    .filter((opportunity) => isRecommendable(opportunity, now));
}

export function profileSources(profile: Profile) {
  return [
    ...(profile.eligibility_notes?.trim()
      ? [{ ref: 'eligibility_notes', text: profile.eligibility_notes }]
      : []),
    ...(profile.education.trim() ? [{ ref: 'education', text: profile.education }] : []),
    ...profile.skills.map((text, i) => ({ ref: `skills.${i}`, text })),
    ...(profile.languages ?? []).map((text, i) => ({ ref: `languages.${i}`, text })),
    ...(profile.interests ?? []).map((text, i) => ({ ref: `interests.${i}`, text })),
    ...profile.claims
      .filter((claim) => claim.user_approved)
      .map((claim) => ({ ref: `claims.${claim.id}`, text: claim.text })),
  ];
}

export function validateComparisons(
  value: z.infer<typeof analysisSchema>,
  opportunities: Opportunity[],
  profile: Profile,
) {
  if (
    value.comparisons.length !== opportunities.length ||
    new Set(value.comparisons.map((c) => c.opportunity_id)).size !== opportunities.length
  )
    throw new Error('Invalid opportunity coverage');
  for (const comparison of value.comparisons) {
    const opportunity = opportunities.find((o) => o.id === comparison.opportunity_id);
    if (!opportunity) throw new Error('Unknown opportunity');
    validateProfileReferences(comparison.rows, profile);
    for (const row of comparison.rows) {
      const requirement = opportunity.requirements.find((r) => r.id === row.requirement_id);
      if (
        requirement?.kind !== 'preference' &&
        row.status !== 'unknown' &&
        row.profile_field_refs.some((ref) => ref.startsWith('interests.'))
      )
        throw new Error('Interest is not qualification evidence');
    }
    scoreRows(opportunity, comparison.rows);
  }
}

export function rankMatches(matches: Match[], profile: Profile) {
  const interests = [...(profile.interests ?? []), profile.target_role ?? '']
    .map((s) => s.toLocaleLowerCase('az'))
    .filter(Boolean);
  const relevant = (match: Match) =>
    (match.opportunity.tags ?? []).filter((tag) =>
      interests.some(
        (interest) =>
          tag.toLocaleLowerCase('az').includes(interest) ||
          interest.includes(tag.toLocaleLowerCase('az')),
      ),
    ).length;
  return [...matches].sort(
    (a, b) =>
      Number(a.eligibility === 'needs_clarification') -
        Number(b.eligibility === 'needs_clarification') ||
      (b.readiness ?? -1) - (a.readiness ?? -1) ||
      relevant(b) - relevant(a) ||
      a.opportunity.id.localeCompare(b.opportunity.id),
  );
}

// A conservative prototype guard: missing information or "I am a student"
// cannot establish "I have no degree/company". Explicit denials can support
// unmet; other potentially contradictory facts remain a clarification question.
export function clarifyUnsupportedNegatives(
  rows: z.infer<typeof comparisonRowSchema>[],
  profile: Profile,
  opportunity?: Opportunity,
) {
  const sources = new Map(profileSources(profile).map((source) => [source.ref, source.text]));
  const explicitDenial =
    /\byox(?:dur)?\b|deyil|olmam|\bno\b|\bnot\b|never|without|don't|doesn't|değil|yok/iu;
  const supportsDenial = (row: z.infer<typeof comparisonRowSchema>) => {
    const requirement = opportunity?.requirements.find((r) => r.id === row.requirement_id);
    const tokens = requirement
      ? (`${requirement.label} ${requirement.criterion.term ?? ''}`
          .toLocaleLowerCase('az')
          .match(/[\p{L}]{4,}/gu) ?? [])
      : [];
    return row.profile_field_refs.some((ref) =>
      (sources.get(ref) ?? '').split(/[.!?;\n]+/u).some((sentence) => {
        if (!explicitDenial.test(sentence)) return false;
        if (!requirement) return true;
        const normalized = sentence.toLocaleLowerCase('az');
        // A denial about a degree must not become evidence of no company.
        // Ambiguous negatives remain unknown, even when another sentence
        // in the same profile field mentions the requirement topic.
        return tokens.some((token) => normalized.includes(token));
      }),
    );
  };
  const directContradiction = (row: z.infer<typeof comparisonRowSchema>) => {
    const term =
      opportunity?.requirements.find((r) => r.id === row.requirement_id)?.criterion.term ?? '';
    const source = row.profile_field_refs.map((ref) => sources.get(ref) ?? '').join(' ');
    // An explicitly declared nationality may contradict a supplied country
    // allowlist; it must not be hidden by the missing-data guard.
    if (
      term.startsWith('Eligible nationals:') &&
      /vətəndaş|vatandaş|citizen|nationality/iu.test(source)
    )
      return true;
    const maximum = term.match(/maximum\s+(\d+)\s+years/iu);
    const years = source.match(
      /(\d+)\s*(?:il(?:lik)?|years?)\s*(?:of\s+)?(?:iş|peşə|professional|work)/iu,
    );
    return Boolean(maximum && years && Number(years[1]) > Number(maximum[1]));
  };
  return rows.map((row) =>
    row.status === 'unmet' && !directContradiction(row) && !supportsDenial(row)
      ? {
          ...row,
          status: 'unknown' as const,
          rationale:
            'Mənbə bu şərti açıq şəkildə rədd etmir. Əlavə məlumatla dəqiqləşdirilməlidir.',
        }
      : row,
  );
}

export async function matchCatalog(profile: Profile) {
  const now = new Date();
  const all = activeCatalog(now);
  const candidates = all.filter(
    (o) => !profile.opportunity_types?.length || profile.opportunity_types.includes(o.category),
  );
  if (!candidates.length) return { matches: [], excluded_matches: [], catalog_count: all.length };
  // Bound by requirement count as well as records: large job descriptions
  // otherwise consume the repair budget before the last row is validated.
  const batches: Opportunity[][] = [];
  for (const candidate of candidates) {
    const last = batches.at(-1);
    if (
      !last ||
      last.length >= 3 ||
      last.reduce((sum, item) => sum + item.requirements.length, 0) +
        candidate.requirements.length >
        24
    )
      batches.push([candidate]);
    else last.push(candidate);
  }
  let next = 0;
  const completed: z.infer<typeof analysisSchema>['comparisons'] = [];
  const failedIds: string[] = [];
  let firstError: unknown;
  await Promise.all(
    Array.from({ length: Math.min(3, batches.length) }, async () => {
      while (next < batches.length) {
        const batch = batches[next++];
        try {
          const result = await structured(
            'comparison',
            'For met OR unmet on ANY non-preference requirement, interests.* references are forbidden. A social-impact interest does not show a product benefiting children. Student status does NOT prove no previous degree, no company or no future PhD application. Only an explicit statement of absence/contradiction can be unmet; otherwise unknown. ' +
              'Compare ONLY the supplied opportunities with the confirmed profile sources. Return each opportunity_id once and EVERY requirement_id exactly once. No scores, new opportunities, URLs or IDs. status met requires positive support and exact source ref(s); unmet needs explicit contradictory evidence, absence is unknown. All known refs must be from profile_sources. Do not equate studying/learning a skill with mastering it. Never infer citizenship from language/location, English proficiency from English text, graduation from student status, or company eligibility from individual skills. Use ONLY eligibility country lists supplied in requirement.term, not external knowledge. Interest is relevant only to preference criteria; it cannot meet technical skills, degree or legal conditions. Keep each rationale concise, maximum 220 characters, in output_language. Self-reported sources are not independently verified. Each comparisons entry must contain opportunity_id and rows; each row requirement_id,status,rationale,profile_field_refs.',
            {
              profile_sources: profileSources(profile),
              target_role: profile.target_role,
              location_preference: profile.location ?? '',
              opportunities: batch.map((o) => ({
                id: o.id,
                name: o.name,
                category: o.category,
                requirements: o.requirements,
              })),
            },
            analysisSchema,
            profile.locale,
            (value) => validateComparisons(value, batch, profile),
          );
          validateComparisons(result, batch, profile);
          completed.push(...result.comparisons);
        } catch (error) {
          firstError ??= error;
          failedIds.push(...batch.map((o) => o.id));
        }
      }
    }),
  );
  if (!completed.length)
    throw firstError ?? new RequestError('MATCH_FAILED', 'Müqayisə tamamlanmadı.', 503);
  const matches = completed
    .map((comparison) => {
      const opportunity = candidates.find((o) => o.id === comparison.opportunity_id)!;
      return {
        opportunity,
        ...scoreRows(
          opportunity,
          clarifyUnsupportedNegatives(comparison.rows, profile, opportunity),
        ),
      };
    })
    .filter((match) => isRecommendable(match.opportunity, new Date()));
  return {
    matches: rankMatches(
      matches.filter((m) => m.eligibility !== 'ineligible'),
      profile,
    ),
    excluded_matches: matches.filter((m) => m.eligibility === 'ineligible'),
    catalog_count: all.length,
    analyzed_count: completed.length,
    failed_opportunity_ids: failedIds,
    warnings: failedIds.length
      ? [
          `${failedIds.length} elanın AI müqayisəsi tamamlanmadı. Yenidən yoxla; bu elanlara faiz verilməyib.`,
        ]
      : [],
  };
}
