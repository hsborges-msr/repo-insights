import { z } from 'zod';
import { ActorSchema } from './Actor';

export const RepositorySchema = z.object({
  id: z.string(),
  name: z.string(),
  name_with_owner: z.string(),
  description: z.string().optional(),
  owner: ActorSchema,
  stargazers_count: z.number().int(),
  watchers_count: z.number().int(),
  fork_count: z.number().int(),
  issues_count: z.number().int(),
  pull_requests_count: z.number().int(),
  releases_count: z.number().int(),
  branches_count: z.number().int(),
  milestones_count: z.number().int(),
  // empty repositories have no default branch to count commits from
  commits_count: z.number().int().optional()
});

export type Repository = z.output<typeof RepositorySchema>;