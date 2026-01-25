import { useMemo } from 'react';
import { Release, Stargazer, Watcher } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import { mergeActorData } from '@/helpers/actors';

export function useRepositoryData(stars: Stargazer[], releases: Release[], watchers: Watcher[]) {
  return useMemo<ActorInfo[]>(() => mergeActorData(stars, releases, watchers), [stars, releases, watchers]);
}
