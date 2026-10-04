import { z } from 'zod';

/**
 * GitHub actor (user or organization) with the profile fields displayed by the app.
 */
export const ActorSchema = z.object({
  __typename: z.string(),
  id: z.string(),
  login: z.string(),
  avatar_url: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  created_at: z.coerce.date().optional(),
  followers_count: z.number().int().optional(),
  following_count: z.number().int().optional(),
  social_accounts: z.record(z.string(), z.string()).optional(),
  is_hireable: z.boolean().optional(),
  is_github_star: z.boolean().optional(),
  is_campus_expert: z.boolean().optional()
});

export type Actor = z.output<typeof ActorSchema>;