import { describe, expect, it, vi } from 'vitest';
import { Repository } from '@/entities/Repository';
import { Watcher } from '@/entities/Watcher';
import { Cache, CacheService } from './cache';
import { ResourcePage, Service } from './service';

class MemoryCache implements Cache {
  readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

const watcher = (login: string): Watcher => ({
  repository: 'repo',
  user: { __typename: 'User', id: login, login, avatar_url: '' }
});

// Three pages: [a] -> c1 -> [b] -> c2 -> [c]
const pages: Record<string, ResourcePage<Watcher>> = {
  '': { data: [watcher('a')], metadata: { has_more: true, cursor: 'c1' } },
  c1: { data: [watcher('b')], metadata: { has_more: true, cursor: 'c2' } },
  c2: { data: [watcher('c')], metadata: { has_more: false } }
};

function createService() {
  const service = {
    repository: vi.fn(async () => ({ id: 'repo' }) as Repository),
    resources: vi.fn((_resource: string, opts: { cursor?: string }) => ({
      async *[Symbol.asyncIterator]() {
        let cursor = opts.cursor;
        do {
          const page = pages[cursor || ''];
          yield page;
          cursor = page.metadata.cursor;
        } while (cursor);
      }
    }))
  };

  return service as typeof service & Service;
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of iterable) result.push(item);
  return result;
}

describe('CacheService', () => {
  it('caches repositories case-insensitively', async () => {
    const service = createService();
    const cached = new CacheService(service, new MemoryCache());

    await cached.repository('Owner', 'Name');
    await cached.repository('owner', 'name');

    expect(service.repository).toHaveBeenCalledTimes(1);
  });

  it('replays cached pages and resumes from the last cached cursor', async () => {
    const service = createService();
    const cache = new MemoryCache();
    const cached = new CacheService(service, cache);

    cache.store.set('watchers:repo:', pages['']);

    const result = await collect(cached.resources('watchers', { repository: 'repo' }));

    expect(result.map((p) => [p.data[0].user.login, !!p.__cached])).toEqual([
      ['a', true],
      ['b', false],
      ['c', false]
    ]);
    expect(service.resources).toHaveBeenCalledWith('watchers', { repository: 'repo', cursor: 'c1' });
    expect([...cache.store.keys()]).toEqual(['watchers:repo:', 'watchers:repo:c1', 'watchers:repo:c2']);
  });

  it('does not hit the service when the cached chain is complete', async () => {
    const service = createService();
    const cache = new MemoryCache();
    const cached = new CacheService(service, cache);

    await collect(cached.resources('watchers', { repository: 'repo' }));
    const result = await collect(cached.resources('watchers', { repository: 'repo' }));

    expect(service.resources).toHaveBeenCalledTimes(1);
    expect(result.every((p) => p.__cached)).toBe(true);
  });

  it('ignores cache failures', async () => {
    const service = createService();
    const cache = new MemoryCache();
    cache.get = async () => Promise.reject(new Error('broken'));
    cache.set = async () => Promise.reject(new Error('broken'));

    const result = await collect(new CacheService(service, cache).resources('watchers', { repository: 'repo' }));

    expect(result).toHaveLength(3);
  });
});