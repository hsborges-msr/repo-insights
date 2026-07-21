'use client';

import { clear, createStore, del, get, set, UseStore } from 'idb-keyval';
import lzString from 'lz-string';
import { CACHE_TTL } from '@/constants';
import { Cache, CacheService, ReleaseSchema, RepositorySchema, StargazerSchema } from '@/core';

/**
 *  Compress data
 */
function compress<T>(value: T): string {
  return lzString.compressToBase64(JSON.stringify(value));
}

/**
 *  Decompress data
 */
function decompress<T>(value: string): T {
  return JSON.parse(lzString.decompressFromBase64(value));
}

function isCacheKeyFor(key: string, prefix: string): boolean {
  return key.startsWith(`${prefix}:`) || key.includes(`:${prefix}:`);
}

/**
 * Browser cache
 */
export class BrowserCache implements Cache {
  private readonly cache: UseStore;

  constructor(namespace: string = 'public') {
    this.cache = createStore(namespace.toLowerCase(), 'caching');
  }

  async get<T>(key: string): Promise<T | null> {
    // Stored values in IDB are compressed strings. Retrieve as `string | null`.
    const raw = (await get<string | null>(key, this.cache)) as string | null;

    if (!raw) return null;

    // Decompress and parse safely to unknown, then assign __cached marker.
    const parsed = decompress<unknown>(raw) as unknown;
    // Ensure we operate on an object
    if (typeof parsed !== 'object' || parsed === null) return null;
    // Build a flexible value object with expected cache markers
    const value = Object.assign({ __cached: true }, parsed as Record<string, unknown>);

    if (!value) return null;

    if (!value.__cached_at) return null;

    const ageMs = Date.now() - Number(value.__cached_at);

    // Global upper bound: if older than USER TTL, drop it
    if (ageMs > CACHE_TTL.USER) return null;

    if (isCacheKeyFor(key, CacheService.REPOSITORY_PREFIX)) {
      // Repository-specific TTL is shorter
      if (ageMs > CACHE_TTL.REPOSITORY) return null;
      return RepositorySchema.parse(value) as unknown as T;
    } else if (isCacheKeyFor(key, CacheService.RELEASES_PREFIX)) {
      if (ageMs > CACHE_TTL.STARGAZERS) return null;
      // Validate each release record
      const v = Object.assign(value, {
        data: (value.data as unknown[]).map((record) => ReleaseSchema.parse(record))
      });

      return v as T;
    } else if (isCacheKeyFor(key, CacheService.STARGAZERS_PREFIX)) {
      if (ageMs > CACHE_TTL.STARGAZERS) return null;
      const v = Object.assign(value, {
        data: (value.data as unknown[]).map((record) => StargazerSchema.parse(record))
      });

      return v as T;
    }

    return value as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await set(key, compress(Object.assign({ __cached_at: Date.now() }, value)), this.cache);
  }

  async remove(key: string): Promise<void> {
    await del(key, this.cache);
  }

  async clear(): Promise<void> {
    await clear(this.cache);
  }
}