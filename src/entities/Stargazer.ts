import { z } from 'zod';
import { ActorSchema } from './Actor';

export const StargazerSchema = z.object({
  repository: z.string(),
  starred_at: z.coerce.date(),
  user: ActorSchema
});

export type Stargazer = z.output<typeof StargazerSchema>;