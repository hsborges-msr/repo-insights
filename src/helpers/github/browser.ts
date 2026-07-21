import { CacheService, GithubService } from '@/core';
import { BrowserCache } from '../cache/browser';
import { createService as create } from './base';

/**
 *  Create a browser service
 */
export function createService(namespace?: string, token?: string, cache?: false): GithubService;
export function createService(namespace?: string, token?: string, cache?: true): CacheService;
export function createService(namespace?: string, token?: string, cache: boolean = true): CacheService | GithubService {
  return create(namespace, token, cache ? BrowserCache : undefined);
}