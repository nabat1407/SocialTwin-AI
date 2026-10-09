import { z } from 'zod';

export const localeSchema = z.enum(['az', 'tr', 'en']);
export const categorySchema = z.enum(['internship', 'scholarship', 'job', 'grant']);
const preferencesShape = {
  contact: z
    .object({
      email: z.string().trim().max(150),
      phone: z.string().trim().max(80),
      website: z.string().trim().max(250),
    })
    .strict()
    .optional(),
  interests: z.array(z.string().trim().min(1).max(100)).max(15).optional(),
  languages: z.array(z.string().trim().min(1).max(100)).max(10).optional(),
  location: z.string().trim().max(120).optional(),
  eligibility_notes: z.string().trim().max(1600).optional(),
  opportunity_types: z.array(categorySchema).max(4).optional(),
};
const shortText = z.string().trim().min(1).max(1000);
export const extractionSchema = z
  .object({
    name: z.string().max(120),
    ...preferencesShape,
    target_role: shortText.nullable(),
    education: z.string().max(1000),
    skills: z.array(z.string().trim().min(1).max(100)).max(20),
    claims: z.array(shortText).max(12),
    missing_information: z.array(shortText).max(10),
  })
  .strict();
export const profileSchema = z
  .object({
    id: z.string().min(1).max(100),
    revision: z.number().int().positive(),
    ...preferencesShape,
    locale: localeSchema,
    name: z.string().max(120),
    target_role: shortText.nullable(),
    education: z.string().max(1000),
    skills: z.array(z.string().trim().min(1).max(100)).max(20),
    claims: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            text: shortText,
            user_approved: z.boolean(),
            sources: z
              .array(
                z
                  .object({
                    id: z.string().min(1).max(100),
                    repository: z.string().max(150),
                    path: z.string().max(300),
                    source_url: z
                      .string()
                      .url()
                      .regex(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:blob|commit)\//),
                    observed_fact: z.string().min(1).max(1000),
                    attribution: z.enum(['limited', 'linked_commit']),
                  })
                  .strict(),
              )
              .max(4)
              .optional(),
          })
          .strict(),
      )
      .max(20),
    confirmed_at: z.string().datetime().nullable(),
    missing_information: z.array(shortText).max(10),
  })
  .strict()
  .refine(
    (p) => new Set(p.claims.map((c) => c.id)).size === p.claims.length,
    'Duplicate claim IDs',
  );
export const extractionRequestSchema = z
  .object({ text: z.string().trim().min(10).max(8000), locale: localeSchema })
  .strict();
export const packageRequestSchema = z
  .object({ profile: profileSchema, opportunity_id: z.string().max(100).nullable() })
  .strict();
export const draftSchema = z
  .object({
    resume: z
      .array(
        z
          .object({
            text: shortText,
            section: z
              .enum([
                'summary',
                'education',
                'experience',
                'projects',
                'skills',
                'languages',
                'research',
                'publications',
                'awards',
                'volunteering',
              ])
              .optional(),
            claim_ids: z.array(z.string().min(1).max(100)).min(1).max(12),
          })
          .strict(),
      )
      .min(1)
      .max(15),
    cv: z
      .array(
        z
          .object({
            text: shortText,
            section: z
              .enum([
                'summary',
                'education',
                'experience',
                'projects',
                'skills',
                'languages',
                'research',
                'publications',
                'awards',
                'volunteering',
              ])
              .optional(),
            claim_ids: z.array(z.string().min(1).max(100)).min(1).max(12),
          })
          .strict(),
      )
      .min(1)
      .max(15),
    letter: z
      .array(
        z
          .object({ text: shortText, claim_ids: z.array(z.string().min(1).max(100)).max(12) })
          .strict(),
      )
      .max(5),
    action_plan: z
      .array(
        z
          .object({
            title: shortText,
            deliverable: shortText,
            estimated_minutes: z.number().int().min(5).max(120),
          })
          .strict(),
      )
      .min(4)
      .max(5),
    cv_suggestions: z.array(shortText).length(3),
  })
  .strict();

export type Profile = z.infer<typeof profileSchema>;
export type Draft = z.infer<typeof draftSchema>;
export type Locale = z.infer<typeof localeSchema>;
export type Requirement = {
  id: string;
  label: string;
  kind: 'eligibility' | 'skill' | 'document' | 'preference';
  mandatory: boolean;
  criterion: {
    field: 'skills' | 'education' | 'document' | 'claims' | 'languages' | 'interests';
    term: string;
  };
};
export type Opportunity = {
  id: string;
  name: string;
  organization: string;
  category: z.infer<typeof categorySchema>;
  location: string;
  description: string;
  requirements: Requirement[];
  deadline: {
    kind: 'fixed_date' | 'fixed_datetime' | 'rolling' | 'unknown';
    date: string | null;
    instant?: string;
    source_text?: string;
  };
  source_url: string | null;
  verified_at: string | null;
  verification_status: 'verified' | 'pending' | 'rejected';
  fixture: boolean;
  tags?: string[];
  benefit?: string;
  source_excerpt?: string;
  work_mode?: 'onsite' | 'hybrid' | 'remote' | 'unspecified';
  writing_policy?: 'standard' | 'own_words' | 'disclose_ai';
};
export const comparisonRowSchema = z
  .object({
    requirement_id: shortText,
    status: z.enum(['met', 'unmet', 'unknown']),
    rationale: shortText,
    profile_field_refs: z.array(shortText).max(20),
  })
  .strict();
export type ComparisonRow = z.infer<typeof comparisonRowSchema>;
export type Match = {
  opportunity: Opportunity;
  rows: ComparisonRow[];
  met: number;
  unmet: number;
  unknown: number;
  total: number;
  readiness: number | null;
  evidence_coverage: number | null;
  blocking_requirement_ids: string[];
  eligibility: 'eligible' | 'ineligible' | 'needs_clarification';
};
export type Package = {
  draft: Draft;
  mode: 'fixture' | 'live';
  opportunity_id: string | null;
  opportunity_name: string | null;
  opportunity_source_url?: string | null;
  opportunity_organization?: string | null;
  opportunity_deadline?: Opportunity['deadline'] | null;
  writing_policy?: Opportunity['writing_policy'];
  profile_revision: number;
};
