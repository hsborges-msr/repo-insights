import { useMemo } from 'react';
import { ActorInfo } from '@/entities/ActorInfo';
import { Release } from '@/entities/Release';
import { Stargazer } from '@/entities/Stargazer';
import { Watcher } from '@/entities/Watcher';
import { mergeActorData } from '@/helpers/actors';

export function useRepositoryData(stars: Stargazer[], releases: Release[], watchers: Watcher[]) {
  return useMemo<ActorInfo[]>(() => mergeActorData(stars, releases, watchers), [stars, releases, watchers]);
}