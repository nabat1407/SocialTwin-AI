import { z } from 'zod';
import { categorySchema } from './schemas';

const text = z.string().trim().min(1).max(2000);
const id = z.string().trim().min(1).max(100);
const date = z.iso.date();
const httpsUrl = z.url({ protocol: /^https$/ });
export const deadlineSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('fixed_date'), date, source_text: text }).strict(),
  z
    .object({
      kind: z.literal('fixed_datetime'),
      date,
      time: z.iso.time(),
      timezone: text,
      instant: z.iso.datetime({ offset: true }),
      source_text: text,
    })
    .strict()
    .refine((value) => {
      try {
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: value.timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        }).formatToParts(new Date(value.instant));
        const part = (type: string) => parts.find((p) => p.type === type)?.value;
        return (
          `${part('year')}-${part('month')}-${part('day')}` === value.date &&
          `${part('hour')}:${part('minute')}:${part('second')}` === value.time
        );
      } catch {
        return false;
      }
    }, 'Deadline instant must agree with source date, time and timezone'),
  z.object({ kind: z.literal('rolling'), date: z.null(), source_text: text }).strict(),
  z.object({ kind: z.literal('unknown'), date: z.null(), source_text: text }).strict(),
]);

export const opportunitySchema = z
  .object({
    id,
    name: text,
    organization: text,
    category: categorySchema,
    location: text,
    work_mode: z.enum(['onsite', 'hybrid', 'remote', 'unspecified']),
    description: text,
    tags: z.array(z.string().min(1).max(100)).max(15).optional(),
    benefit: text.optional(),
    writing_policy: z.enum(['standard', 'own_words', 'disclose_ai']).optional(),
    source_url: httpsUrl,
    verified_at: z.iso.datetime(),
    verification_status: z.enum(['verified', 'pending', 'rejected']),
    fixture: z.literal(false),
    deadline: deadlineSchema,
    source_excerpt: text,
    catalog_version: id,
    requirements: z
      .array(
        z
          .object({
            id,
            label: text,
            kind: z.enum(['eligibility', 'skill', 'document', 'preference']),
            mandatory: z.boolean(),
            criterion: z
              .object({
                field: z.enum([
                  'skills',
                  'education',
                  'document',
                  'claims',
                  'languages',
                  'interests',
                ]),
                term: text,
              })
              .strict(),
            source_locator: text,
          })
          .strict(),
      )
      .min(1)
      .max(40),
  })
  .strict()
  .refine(
    (value) => new Set(value.requirements.map((r) => r.id)).size === value.requirements.length,
    'Duplicate requirement IDs',
  );

export const catalogSchema = z
  .array(opportunitySchema)
  .max(100)
  .refine(
    (values) => new Set(values.map((o) => o.id)).size === values.length,
    'Duplicate opportunity IDs',
  );
