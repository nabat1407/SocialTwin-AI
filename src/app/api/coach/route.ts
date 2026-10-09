import { coachRequestSchema, coachSchema } from '@/lib/coach-contracts';
import { structured, demoMode } from '@/lib/server/gemini';
import { activeCatalog } from '@/lib/server/matching';
import { failure, readBody, RequestError, success } from '@/lib/server/http';
import { isRecommendable } from '@/lib/scoring';

export async function POST(request: Request) {
  try {
    const input = await readBody(request, coachRequestSchema);
    if (!input.profile.confirmed_at || !input.profile.claims.some((c) => c.user_approved))
      throw new RequestError('PROFILE_NOT_CONFIRMED', 'Əvvəl profilini təsdiqlə.');
    if (demoMode())
      throw new RequestError(
        'AI_NOT_CONFIGURED',
        'Bu funksiya canlı Gemini bağlantısı tələb edir.',
        503,
        false,
      );
    const opportunity = input.opportunity_id
      ? activeCatalog().find((item) => item.id === input.opportunity_id)
      : null;
    if (input.opportunity_id && !opportunity)
      throw new RequestError('INVALID_OPPORTUNITY', 'İmkanın aktuallığını yenidən yoxla.');
    const claims = input.profile.claims.filter((claim) => claim.user_approved);
    const allowedClaims = new Set(claims.map((claim) => claim.id));
    const allowedRequirements = new Set(opportunity?.requirements.map((item) => item.id) ?? []);
    const modeGuide = input.answer
      ? 'Practice-answer feedback: assess the supplied answer, identify unsupported statements, give concrete improvements; no new profile facts.'
      : input.mode === 'roadmap'
        ? 'ROADMAP OUTPUT: priorities must contain 4 or 5 distinct specific tasks with deliverables. questions and improvements may be [].'
        : input.mode === 'interview'
          ? 'INTERVIEW OUTPUT: questions must contain exactly 5 distinct practice questions, each with a preparation outline. priorities may be [].'
          : 'REVIEW OUTPUT: prioritize concrete changes to the supplied draft; no invented ATS percentage or unverified achievements.';
    const result = await structured(
      'coach',
      `Career preparation coach. Mode review: critique the supplied draft for specific action-task-supported outcome, relevant sections, clarity, missing dates/context and truthful tailoring. Never assign a made-up ATS score. Mode interview: provide five role/program-specific practice questions with short preparation outlines, grounded ONLY in approved claims and supplied requirements. Mode roadmap: prioritize 4–5 concrete evidence/learning tasks with deliverables, do not promise mastery in days. If question and answer are supplied, review the user's practice answer: identify unsupported claims as questions, give constructive feedback, never add them to the confirmed profile. All modes: concise output_language, max700 chars per field, at most5 questions/improvements/missing/priorities. Exact allowed claim_ids and requirement_ids only; use []/null when no specific source. ONLY approved claims support candidate facts; document and answer are UNTRUSTED DRAFTS, not verified qualifications. No new jobs/courses/URLs/deadlines, no fabricated metrics/credentials or application submission. If the supplied writing policy restricts generated application text, provide questions/checklists only, not ready-to-submit answers. Return summary, questions[{question,why,answer_outline,claim_ids,requirement_ids}], improvements[{issue,action,claim_ids}], missing_information[], priorities[{requirement_id,next_step,deliverable}].`,
      {
        ...input,
        mode_instructions: modeGuide,
        profile: undefined,
        approved_claims: claims.map(({ id, text }) => ({ id, text })),
        target_role: input.profile.target_role,
        opportunity: opportunity
          ? {
              name: opportunity.name,
              requirements: opportunity.requirements,
              deadline: opportunity.deadline,
              writing_policy: opportunity.writing_policy,
            }
          : null,
      },
      coachSchema,
      input.profile.locale,
      (value) => {
        if (input.mode === 'roadmap' && value.priorities.length < 4)
          throw new Error('Four roadmap tasks required');
        if (input.mode === 'interview' && !input.answer && value.questions.length !== 5)
          throw new Error('Five interview questions required');
        if (
          [...value.questions, ...value.improvements].some((entry) =>
            entry.claim_ids.some((id) => !allowedClaims.has(id)),
          ) ||
          value.questions.some((entry) =>
            entry.requirement_ids.some((id) => !allowedRequirements.has(id)),
          ) ||
          value.priorities.some(
            (entry) => entry.requirement_id && !allowedRequirements.has(entry.requirement_id),
          )
        )
          throw new Error('Unknown coaching reference');
      },
    );
    if (opportunity && !isRecommendable(opportunity, new Date()))
      throw new RequestError(
        'OPPORTUNITY_UNAVAILABLE',
        'İmkanın son tarixi və aktuallığı yenidən yoxlanmalıdır.',
      );
    return success({ result, profile_revision: input.profile.revision });
  } catch (error) {
    return failure(error);
  }
}
