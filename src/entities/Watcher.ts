import { z } from 'zod';
import { ActorSchema } from './Actor';

export const WatcherSchema = z.object({
  repository: z.string(),
  user: ActorSchema
});

export type Watcher = z.output<typeof WatcherSchema>;