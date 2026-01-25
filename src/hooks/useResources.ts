import { useEffect, useState } from 'react';
import { useBoolean } from 'react-use';
import { AsyncState } from 'react-use/lib/useAsyncFn';
import { Release, RepositoryNode, Stargazer, Watcher } from '@/core';
import { createService } from '@/helpers/github/browser';
import useAuth from './useAuth';
import useRepository from './useRepository';

export type IterableAsyncState<T> = AsyncState<T[]> & {
  value?: T[];
  hasMore: boolean;
  cached: boolean;
};

type Resource = 'stargazers' | 'releases' | 'watchers';

export default function useResources(
  owner: string,
  name: string,
  resource: 'stargazers',
  paused?: boolean
): IterableAsyncState<Stargazer>;

export default function useResources(
  owner: string,
  name: string,
  resource: 'releases',
  paused?: boolean
): IterableAsyncState<Release>;

export default function useResources(
  owner: string,
  name: string,
  resource: 'watchers',
  paused?: boolean
): IterableAsyncState<Watcher>;

/**
 *  Hook to fetch tags of a repository
 */
export default function useResources<T extends RepositoryNode>(
  owner: string,
  name: string,
  resource: Resource,
  paused?: boolean
): IterableAsyncState<T> {
  const { user } = useAuth();
  const { value: repo } = useRepository(owner, name);

  const [data, setData] = useState<{ records: T[]; cursor?: string; hasMore: boolean; cached: boolean }>({
    records: [],
    hasMore: true,
    cached: true
  });

  const [loading, setLoading] = useBoolean(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([setLoading(), setError(null)])
      .then(async () => {
        if (paused || !repo) return;

        // @ts-expect-error - This is a hack to avoid type errors
        const it = createService(repo.name_with_owner, user?.__access_token).resources(resource, {
          repository: repo.id,
          cursor: data.cursor || undefined
        });

        let iteration = 0;
        const cache: T[] = [...data.records];
        const batchSize = Math.ceil((repo.stargazers_count || 0) / 5);

        for await (const element of it) {
          if (controller.signal.aborted) return;
          const { data: records, __cached } = element as typeof element & { __cached?: boolean };

          cache.push(...records);

          if (!__cached || cache.length >= batchSize * iteration || !element.metadata.has_more) {
            setData((pv) => ({
              ...pv,
              records: [...cache],
              cursor: element.metadata.cursor || pv.cursor,
              hasMore: element.metadata.has_more,
              cached: !!__cached
            }));
            iteration++;
          }
        }
      })
      .catch((e) => e.status !== 401 && setError(e))
      .finally(() => setLoading());

    return () => controller.abort();
  }, [user, repo, resource, paused]);

  const controls = { hasMore: data.hasMore, cached: data.cached };

  if (loading) {
    return { ...controls, loading: true, value: data.records };
  } else if (error) {
    return { ...controls, loading: false, error: error };
  } else {
    return { ...controls, loading: false, value: data.records };
  }
}
