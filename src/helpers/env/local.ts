import { z } from 'zod';

export const env = z
  .object({
    GH_CLIENT_ID: z.string().optional(),
    GH_CLIENT_SECRET: z.string().optional()
  })
  .parse(process.env);