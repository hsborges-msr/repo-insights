import retry from 'fetch-retry';
import pLimit from 'p-limit';
import { Constructor } from 'type-fest';
import { API_CONFIG } from '@/constants';
import { Cache, CacheService, GithubClient, GithubService } from '@/core';

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
  const client = new GithubClient('https://api.github.com', { apiToken: token, fetcher });

  const baseService = new GithubService(client, {
    fields: {
      actors: {
        name: true,
        email: true,
        company: true,
        location: true,
        created_at: true,
        followers_count: true,
        following_count: true,
        social_accounts: true,
        is_hireable: true,
        is_github_star: true,
        is_campus_expert: true
      },
      repositories: false
    }
  });

  return Cache ? new CacheService(baseService, new Cache(namespace.toLowerCase())) : baseService;
}
