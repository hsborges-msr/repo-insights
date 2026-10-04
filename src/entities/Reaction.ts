import { z } from 'zod';
import { ActorSchema } from './Actor';

export const ReactionSchema = z.object({
  id: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
  user: ActorSchema.optional()
});

export type Reaction = z.output<typeof ReactionSchema>;