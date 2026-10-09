import {
  comparisonRowSchema,
  type ComparisonRow,
  type Match,
  type Opportunity,
  type Profile,
} from './schemas';
import { z } from 'zod';

export function availability(
  opportunity: Opportunity,
  now: Date,
): 'open' | 'uncertain' | 'expired' {
  const deadline = opportunity.deadline;
  if (deadline.kind === 'rolling') return 'open';
  if (deadline.kind === 'unknown') return 'uncertain';
  if (deadline.kind === 'fixed_datetime') {
    const cutoff = Date.parse(deadline.instant ?? '');
    return !Number.isFinite(cutoff) ? 'uncertain' : cutoff <= now.getTime() ? 'expired' : 'open';
  }
  if (!z.iso.date().safeParse(deadline.date).success) return 'uncertain';
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Baku',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return deadline.date! < today ? 'expired' : deadline.date === today ? 'uncertain' : 'open';
}

export function isRecommendable(opportunity: Opportunity, now: Date) {
  if (
    opportunity.fixture ||
    opportunity.verification_status !== 'verified' ||
    !opportunity.source_url ||
    !opportunity.verified_at ||
    !opportunity.requirements.length
  )
    return false;
  const age = now.getTime() - Date.parse(opportunity.verified_at);
  const cutoff =
    opportunity.deadline.kind === 'fixed_datetime'
      ? opportunity.deadline.instant
      : opportunity.deadline.date;
  const nearDeadline = cutoff && Date.parse(cutoff) - now.getTime() < 72 * 3600000;
  const maxAge = opportunity.deadline.kind === 'rolling' || nearDeadline ? 86400000 : 7 * 86400000;
  return (
    Number.isFinite(age) && age >= 0 && age <= maxAge && availability(opportunity, now) === 'open'
  );
}

export function scoreRows(
  opportunity: Opportunity,
  rows: ComparisonRow[],
): Omit<Match, 'opportunity'> {
  rows = z.array(comparisonRowSchema).parse(rows);
  const requirementIds = new Set(opportunity.requirements.map((r) => r.id));
  if (
    requirementIds.size !== opportunity.requirements.length ||
    rows.length !== requirementIds.size ||
    new Set(rows.map((r) => r.requirement_id)).size !== rows.length ||
    rows.some((r) => !requirementIds.has(r.requirement_id))
  )
    throw new Error('Invalid requirement coverage');
  const met = rows.filter((r) => r.status === 'met').length;
  const unmet = rows.filter((r) => r.status === 'unmet').length;
  const unknown = rows.filter((r) => r.status === 'unknown').length;
  const eligibilityRows = rows.filter((row) =>
    opportunity.requirements.some(
      (r) => r.id === row.requirement_id && r.kind === 'eligibility' && r.mandatory,
    ),
  );
  const eligibility = eligibilityRows.some((r) => r.status === 'unmet')
    ? 'ineligible'
    : eligibilityRows.some((r) => r.status === 'unknown')
      ? 'needs_clarification'
      : 'eligible';
  const blocking_requirement_ids = rows
    .filter(
      (row) =>
        row.status === 'unmet' &&
        opportunity.requirements.some((r) => r.id === row.requirement_id && r.mandatory),
    )
    .map((row) => row.requirement_id);
  return {
    rows,
    met,
    unmet,
    unknown,
    total: rows.length,
    readiness: rows.length ? Math.round((100 * met) / rows.length) : null,
    evidence_coverage: rows.length ? Math.round((100 * (met + unmet)) / rows.length) : null,
    eligibility,
    blocking_requirement_ids,
  };
}

export function validateProfileReferences(rows: ComparisonRow[], profile: Profile) {
  const allowed = new Set([
    ...(profile.education.trim() ? ['education'] : []),
    ...(profile.eligibility_notes?.trim() ? ['eligibility_notes'] : []),
    ...profile.skills.map((_, i) => `skills.${i}`),
    ...(profile.languages ?? []).map((_, i) => `languages.${i}`),
    ...(profile.interests ?? []).map((_, i) => `interests.${i}`),
    ...profile.claims.filter((c) => c.user_approved).map((c) => `claims.${c.id}`),
  ]);
  if (
    rows.some(
      (row) =>
        row.profile_field_refs.some((ref) => !allowed.has(ref)) ||
        (row.status !== 'unknown' && !row.profile_field_refs.length),
    )
  )
    throw new Error('Unsupported comparison');
  return rows;
}

// Narrow literal comparison for labelled fixtures, never used for a live catalog.
export function matchFixtures(profile: Profile, opportunities: Opportunity[]): Match[] {
  return opportunities
    .filter((o) => o.fixture)
    .map((opportunity) => {
      const rows: ComparisonRow[] = opportunity.requirements.map((requirement) => {
        const { field, term } = requirement.criterion;
        const met =
          field === 'skills'
            ? profile.skills.some((s) => s.toLocaleLowerCase('az') === term.toLocaleLowerCase('az'))
            : field === 'education'
              ? profile.education.toLocaleLowerCase('az').includes(term.toLocaleLowerCase('az'))
              : false;
        const refs = !met
          ? []
          : field === 'education'
            ? ['education']
            : profile.skills.flatMap((skill, i) =>
                skill.toLocaleLowerCase('az') === term.toLocaleLowerCase('az')
                  ? [`skills.${i}`]
                  : [],
              );
        return {
          requirement_id: requirement.id,
          status: met ? 'met' : 'unknown',
          rationale: met
            ? 'Təsdiqlədiyiniz profildə qeyd edilib; istifadəçi bəyanıdır.'
            : 'Bu tələb üzrə təsdiqlənmiş məlumat yoxdur.',
          profile_field_refs: refs,
        };
      });
      return { opportunity, ...scoreRows(opportunity, validateProfileReferences(rows, profile)) };
    })
    .filter((m) => m.eligibility !== 'ineligible')
    .sort(
      (a, b) =>
        Number(a.eligibility === 'needs_clarification') -
          Number(b.eligibility === 'needs_clarification') ||
        (b.readiness ?? -1) - (a.readiness ?? -1) ||
        a.opportunity.id.localeCompare(b.opportunity.id),
    )
    .slice(0, 3);
}
