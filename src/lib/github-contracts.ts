import { z } from 'zod';
import { localeSchema } from './schemas';

export const githubUsername = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/);
export const repositoryRequest = z
  .object({ username: githubUsername, consent: z.literal(true) })
  .strict();
export const githubAnalysisRequest = repositoryRequest
  .extend({
    repositories: z
      .array(
        z
          .string()
          .regex(/^[\w.-]+\/[\w.-]+$/)
          .refine((value) => !value.includes('..')),
      )
      .min(1)
      .max(3),
    locale: localeSchema,
  })
  .strict();
export const githubEvidenceSchema = z
  .object({
    id: z.string().min(1).max(100),
    repository: z.string().max(150),
    path: z.string().max(300),
    source_url: z
      .string()
      .url()
      .regex(/^https:\/\/github\.com\//),
    observed_fact: z.string().min(1).max(1000),
    attribution: z.enum(['limited', 'linked_commit']),
  })
  .strict();
export const githubDraftSchema = z
  .object({
    claims: z
      .array(
        z
          .object({
            text: z.string().min(1).max(700),
            evidence_ids: z.array(z.string().min(1).max(100)).min(1).max(4),
            skills: z.array(z.string().min(1).max(80)).max(5),
            contribution_question: z.string().min(1).max(300),
          })
          .strict(),
      )
      .max(6),
  })
  .strict();
export type PublicRepository = {
  full_name: string;
  description: string;
  fork: boolean;
  archived: boolean;
  default_branch: string;
  source_url: string;
};
export type GitHubEvidence = z.infer<typeof githubEvidenceSchema>;
export type GitHubAnalysis = {
  username: string;
  evidence: GitHubEvidence[];
  claims: z.infer<typeof githubDraftSchema>['claims'];
  coverage: {
    repositories_requested: number;
    repositories_scanned: number;
    files_sampled: number;
    linked_commits: number;
    request_count: number;
    partial: boolean;
    retrieved_at: string;
  };
  warnings: string[];
};
