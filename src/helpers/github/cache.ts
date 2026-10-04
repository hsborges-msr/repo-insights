import { Repository } from '@/entities/Repository';
import { Resource, ResourceIterable, ResourceMap, ResourcePage, ResourceParams, Service } from './service';

/**
 * Key-value storage used to cache service responses.
 */
export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Cache failures are best effort: they must never break the underlying request
async function safeGet<T>(cache: Cache, key: string): Promise<T | null> {
  try {
    return await cache.get<T>(key);
  } catch {
    return null;
  }
}

async function safeSet<T>(cache: Cache, key: string, value: T): Promise<void> {
  try {
    await cache.set(key, value);
  } catch {
    // ignore
  }
}

/**
 * Service decorator that caches repositories and resource pages.
 *
 * Resource pages are keyed by the cursor they start from, so an iteration replays the cached chain of pages
 * and then resumes from the GitHub API where the chain ends.
 */
export class CacheService implements Service {
  public static readonly REPOSITORY_PREFIX = 'repository';
  public static readonly RELEASES_PREFIX: Resource = 'releases';
  public static readonly STARGAZERS_PREFIX: Resource = 'stargazers';
  public static readonly WATCHERS_PREFIX: Resource = 'watchers';

  constructor(
    private readonly service: Service,
    private readonly cache: Cache
  ) {}

  async repository(owner: string, name: string): Promise<Repository | null> {
    const key = `${CacheService.REPOSITORY_PREFIX}:${owner}/${name}`.toLowerCase();

    const cached = await safeGet<Repository>(this.cache, key);
    if (cached) return cached;

    const repository = await this.service.repository(owner, name);
    if (repository) await safeSet(this.cache, key, repository);

    return repository;
  }

  resources<R extends Resource>(resource: R, opts: ResourceParams): ResourceIterable<ResourceMap[R]> {
    const { cache, service } = this;
    const pageKey = (cursor?: string) => `${resource}:${opts.repository}:${cursor || ''}`;

    return {
      async *[Symbol.asyncIterator]() {
        let cursor = opts.cursor;

        while (true) {
          const cached = await safeGet<ResourcePage<ResourceMap[R]>>(cache, pageKey(cursor));
          if (!cached) break;

          const { data, metadata } = cached;
          yield { data, metadata, __cached: true };

          if (!metadata.has_more || !metadata.cursor) return;
          cursor = metadata.cursor;
        }

        for await (const page of service.resources(resource, { ...opts, cursor })) {
          if (page.data.length > 0) void safeSet(cache, pageKey(cursor), page);
          yield page;
          cursor = page.metadata.cursor;
        }
      }
    };
  }
}