import { z } from 'zod';
import { ActorSchema } from './Actor';
import { ReactionSchema } from './Reaction';

export const ReleaseSchema = z.object({
  id: z.string(),
  repository: z.string(),
  name: z.string().optional(),
  tag_name: z.string(),
  created_at: z.coerce.date(),
  published_at: z.coerce.date().optional(),
  author: ActorSchema.optional(),
  reactions_count: z.number().int(),
  reactions: z.array(ReactionSchema).optional()
});

export type Release = z.output<typeof ReleaseSchema>;