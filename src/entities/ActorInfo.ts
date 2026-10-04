import { Actor } from './Actor';

export type ActorInfo = Actor & {
  events: Array<{ type: 'starred' | 'release' | 'reaction' | 'watching'; date: Date }>;
};