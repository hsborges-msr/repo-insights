import { useEffect, useState } from 'react';
import { useBoolean } from 'react-use';
import { AsyncState } from 'react-use/lib/useAsyncFn';
import { Release } from '@/entities/Release';
import { Stargazer } from '@/entities/Stargazer';
import { Watcher } from '@/entities/Watcher';
import { createService } from '@/helpers/github/browser';
import { Resource, ResourceIterable, ResourceMap } from '@/helpers/github/service';
import useAuth from './useAuth';
import useRepository from './useRepository';

export type IterableAsyncState<T> = AsyncState<T[]> & {
  value?: T[];
  hasMore: boolean;
  cached: boolean;
};

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
 * Hook to iterate over repository resources (stargazers, releases, watchers).
 *
 * - Creates a paginated async iterator from the core service and accumulates results
 * - Returns a controlled IterableAsyncState with `hasMore` and `cached` flags
 *
 * @param owner Repository owner
 * @param name Repository name
 * @param resource Resource type to fetch ('stargazers' | 'releases' | 'watchers')
 * @param paused When true, the hook will not start fetching
 */
export default function useResources<T extends ResourceMap[Resource]>(
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

        // The public overloads above tie `T` to `resource`
        const it = createService(repo.name_with_owner, user?.__access_token, true).resources(resource, {
          repository: repo.id,
          cursor: data.cursor || undefined
        }) as ResourceIterable<T>;

        let iteration = 0;
        const cache: T[] = [...data.records];
        const batchSize = Math.ceil((repo.stargazers_count || 0) / 5);

        for await (const element of it) {
          if (controller.signal.aborted) return;
          const { data: records, __cached } = element;

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