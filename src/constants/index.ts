/**
 * Application-wide constants
 */

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  REPOSITORY: 24 * 60 * 60 * 1000, // 1 day
  USER: 7 * 24 * 60 * 60 * 1000, // 7 days
  STARGAZERS: 7 * 24 * 60 * 60 * 1000 // 7 days
} as const;

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CONCURRENT_LIMIT: 2
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Date Formats
export const DATE_FORMATS = {
  LONG: 'LLL',
  SHORT: 'L',
  RELATIVE: 'fromNow'
} as const;

// GitHub OAuth
export const GITHUB_CONFIG = {
  OAUTH_URL: 'https://github.com/login/oauth/authorize',
  SCOPE: 'read:user'
} as const;
