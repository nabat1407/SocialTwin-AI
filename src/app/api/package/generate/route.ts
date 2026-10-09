import { packageRequestSchema, draftSchema } from '@/lib/schemas';
import { fixtureOpportunities } from '@/lib/fixtures';
import { fixtureDraft, validateClaimReferences } from '@/lib/package';
import { demoMode, structured } from '@/lib/server/gemini';
import { failure, readBody, RequestError, success } from '@/lib/server/http';
import { activeCatalog } from '@/lib/server/matching';
import { isRecommendable } from '@/lib/scoring';
import { professionalWritingGuide } from '@/lib/writing-guidance';

export async function POST(request: Request) {
  try {
    const { profile, opportunity_id } = await readBody(request, packageRequestSchema);
    if (!profile.confirmed_at || !profile.claims.some((c) => c.user_approved))
      throw new RequestError(
        'PROFILE_NOT_CONFIRMED',
        'Profilinizi və ən azı bir təcrübə maddəsini təsdiqləyin.',
      );
    const opportunity = opportunity_id
      ? (demoMode() ? fixtureOpportunities : activeCatalog()).find((o) => o.id === opportunity_id)
      : null;
    if (opportunity_id && !opportunity)
      throw new RequestError('INVALID_OPPORTUNITY', 'Bu imkan kataloqda yoxdur.');
    if (opportunity?.writing_policy === 'own_words')
      throw new RequestError(
        'OWN_WORDS_REQUIRED',
        'Bu mənbə müraciət mətnini öz sözlərinlə yazmağı tələb edir. AI məşqçisi ilə hazırlıq suallarını yoxlaya bilərsən.',
      );
    const approvedProfile = { ...profile, claims: profile.claims.filter((c) => c.user_approved) };
    const draft = demoMode()
      ? fixtureDraft(approvedProfile, Boolean(opportunity))
      : await structured(
          'writing',
          `${professionalWritingGuide}\n${opportunity ? 'Generate the selected opportunity letter and tailor both documents to that opportunity. All actions must be feasible before the supplied cutoff.' : 'CV-only: letter must be []; do not invent an organisation or deadline.'}${opportunity?.writing_policy === 'disclose_ai' ? ' This fund requires applicants to write proposals themselves and disclose AI assistance. Do not draft a funding proposal. Letter must be []; action plan must include writing the proposal in own words and preserving/disclosing AI interactions per the source policy.' : ''}`,
          {
            approved_claims: approvedProfile.claims.map(({ id, text }) => ({ id, text })),
            target_role: approvedProfile.target_role,
            selected_opportunity: opportunity
              ? {
                  name: opportunity.name,
                  organisation: opportunity.organization,
                  requirements: opportunity.requirements,
                  deadline: opportunity.deadline,
                }
              : null,
          },
          draftSchema,
          profile.locale,
          (result) => {
            validateClaimReferences(
              result,
              approvedProfile,
              Boolean(opportunity) && opportunity?.writing_policy !== 'disclose_ai',
            );
            if ([...result.resume, ...result.cv].some((entry) => !entry.section))
              throw new Error('Document section required');
          },
        );
    try {
      validateClaimReferences(
        draft,
        approvedProfile,
        Boolean(opportunity) && opportunity?.writing_policy !== 'disclose_ai',
      );
    } catch {
      throw new RequestError('INVALID_AI_OUTPUT', 'Sənəddə təsdiqlənməmiş istinad var.', 502);
    }
    if (opportunity && !demoMode() && !isRecommendable(opportunity, new Date()))
      throw new RequestError(
        'OPPORTUNITY_UNAVAILABLE',
        'Bu imkanın son tarixi və aktuallığı yenidən yoxlanmalıdır.',
      );
    return success({
      draft,
      mode: demoMode() ? 'fixture' : 'live',
      opportunity_id,
      opportunity_name: opportunity?.name ?? null,
      opportunity_source_url: opportunity?.source_url ?? null,
      opportunity_organization: opportunity?.organization ?? null,
      opportunity_deadline: opportunity?.deadline ?? null,
      writing_policy: opportunity?.writing_policy ?? 'standard',
      profile_revision: profile.revision,
    });
  } catch (error) {
    return failure(error);
  }
}
