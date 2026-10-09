import { z } from 'zod';
import { profileSchema } from './schemas';
const text = z.string().trim().min(1).max(700);
export const coachRequestSchema = z
  .object({
    profile: profileSchema,
    opportunity_id: z.string().max(100).nullable(),
    mode: z.enum(['review', 'interview', 'roadmap']),
    document: z.string().max(8000).optional(),
    question: z.string().max(700).optional(),
    answer: z.string().max(3000).optional(),
  })
  .strict();
export const coachSchema = z
  .object({
    summary: text,
    questions: z
      .array(
        z
          .object({
            question: text,
            why: text,
            answer_outline: text,
            claim_ids: z.array(z.string()).max(20),
            requirement_ids: z.array(z.string()).max(40),
          })
          .strict(),
      )
      .max(5),
    improvements: z
      .array(
        z.object({ issue: text, action: text, claim_ids: z.array(z.string()).max(20) }).strict(),
      )
      .max(5),
    missing_information: z.array(text).max(5),
    priorities: z
      .array(
        z
          .object({
            requirement_id: z.string().max(100).nullable(),
            next_step: text,
            deliverable: text,
          })
          .strict(),
      )
      .max(5),
  })
  .strict();
export type CoachResult = z.infer<typeof coachSchema>;
