import { Actor } from '@/core';

export type ActorInfo = Actor & {
  events: Array<{ type: 'starred' | 'release' | 'reaction' | 'watching'; date: Date }>;
};