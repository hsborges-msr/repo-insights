import flatten from 'lodash-es/flatten';
import groupBy from 'lodash-es/groupBy';
import orderBy from 'lodash-es/orderBy';
import { ActorInfo } from '@/entities/ActorInfo';
import { Release } from '@/entities/Release';
import { Stargazer } from '@/entities/Stargazer';
import { Watcher } from '@/entities/Watcher';

export function mergeActorData(
  stars: Stargazer[] = [],
  releases: Release[] = [],
  watchers: Watcher[] = []
): ActorInfo[] {
  const starred: ActorInfo[] = stars.map((s) => ({
    ...s.user,
    events: [{ type: 'starred', date: s.starred_at }]
  }));

  const watched: ActorInfo[] = watchers.map((s) => ({
    ...s.user,
    events: [{ type: 'watching', date: new Date(0) }]
  }));

  const released = releases
    .map((r) => (r.author ? { ...r.author, events: [{ type: 'release', date: r.created_at }] } : null))
    .filter((a) => a !== null) as ActorInfo[];

  const reacted = flatten(
    releases.map((r) => {
      return (r.reactions || []).map(
        (ra) =>
          ({
            ...ra.user,
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