import { z } from 'zod';

export const env = z
  .object({
    BASE_URL: z.string(),
    GA_ID: z.string(),
    GH_CLIENT_ID: z.string(),
    GH_OAUTH_URL: z.string().optional(),
    GH_OAUTH_SCOPE: z.string().optional()
  })
  .parse({
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    GH_CLIENT_ID: process.env.NEXT_PUBLIC_GH_CLIENT_ID,
    GH_OAUTH_URL: process.env.NEXT_PUBLIC_GH_OAUTH_URL,
    GH_OAUTH_SCOPE: process.env.NEXT_PUBLIC_GH_OAUTH_SCOPE
  });
