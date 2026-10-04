import retry from 'fetch-retry';
import pLimit from 'p-limit';
import { Constructor } from 'type-fest';
import { API_CONFIG } from '@/constants';
import { Cache, CacheService } from './cache';
import { GithubClient } from './client';
import { GithubService } from './service';

/**
 *
 */
function limiter(func: typeof fetch) {
  const limit = pLimit(API_CONFIG.CONCURRENT_LIMIT);

  return async (...args: Parameters<typeof fetch>) => {
    return limit(() => func(...args));
  };
}

const fetcher = limiter(
  retry(fetch, {
    retries: API_CONFIG.MAX_RETRIES,
    // exponential backoff starting from API_CONFIG.RETRY_DELAY
    retryDelay: (attempt) => API_CONFIG.RETRY_DELAY * 2 ** (attempt - 1),
    retryOn: (_attempt, error, response) => {
      return !!(error !== null || response?.status === 403);
    }
  })
);

/**
 *  Create a service
 */
export function createService(namespace?: string, token?: string): GithubService;
export function createService(namespace?: string, token?: string, Cache?: Constructor<Cache>): CacheService;
export function createService(namespace: string = 'public', token?: string, Cache?: Constructor<Cache>) {
  const service = new GithubService(new GithubClient('https://api.github.com', { token, fetcher }));

  return Cache ? new CacheService(service, new Cache(namespace.toLowerCase())) : service;
}