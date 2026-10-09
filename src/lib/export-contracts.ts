import { z } from 'zod';

export const exportRequestSchema = z
  .object({
    text: z.string().trim().min(1).max(20000),
    name: z.string().max(120),
    locale: z.enum(['az', 'tr', 'en']),
    kind: z.enum(['resume', 'cv', 'letter', 'plan']),
    template: z.enum(['modern', 'classic']),
    approved: z.literal(true),
    demo: z.boolean(),
  })
  .strict();
export type ExportRequest = z.infer<typeof exportRequestSchema>;
