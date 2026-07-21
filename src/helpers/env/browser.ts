import { z } from 'zod';
import { GITHUB_CONFIG } from '@/constants';

export const env = z
  .object({
    BASE_URL: z.string(),
    GA_ID: z.string(),
    GH_CLIENT_ID: z.string(),
    GH_OAUTH_URL: z.string().default(GITHUB_CONFIG.OAUTH_URL),
    GH_OAUTH_SCOPE: z.string().default(GITHUB_CONFIG.SCOPE)
  })
  .parse({
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    GH_CLIENT_ID: process.env.NEXT_PUBLIC_GH_CLIENT_ID
  });