import flatten from 'lodash-es/flatten';
import groupBy from 'lodash-es/groupBy';
import orderBy from 'lodash-es/orderBy';
import { Actor, Reaction, Release, Stargazer, User, Watcher } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';

export function mergeActorData(
  stars: Stargazer[] = [],
  releases: Release[] = [],
  watchers: Watcher[] = []
): ActorInfo[] {
  const starred: ActorInfo[] = stars.map((s) => ({
    ...(s.user as User),
    events: [{ type: 'starred', date: s.starred_at }]
  }));

  const watched: ActorInfo[] = watchers.map((s) => ({
    ...(s.user as User),
    events: [{ type: 'watching', date: new Date(0) }]
  }));

  const released = releases
    .map((r) => (r.author ? { ...r.author, events: [{ type: 'release', date: r.created_at }] } : null))
    .filter((a) => a !== null) as ActorInfo[];

  const reacted = flatten(
    releases.map((r) => {
      return ((r.reactions || []) as Reaction[])?.map(
        (ra) =>
          ({
            ...(ra.user as Actor),
            events: [{ type: 'reaction', date: ra.created_at }]
          }) as ActorInfo
      );
    })
  );

  const merged = Object.values(groupBy([...starred, ...released, ...watched, ...reacted], 'id')).map((rest) => ({
    ...rest.at(0),
    events: orderBy(flatten(rest.map((e) => e.events)), 'date', 'desc')
  }));

  return orderBy(merged, 'events.[0].date', 'desc') as ActorInfo[];
}