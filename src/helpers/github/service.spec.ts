import { describe, expect, it, vi } from 'vitest';
import { Fetcher, GithubClient, GithubError } from './client';
import { GithubService } from './service';

type Request = { query: string; variables: Record<string, unknown> };

const actor = (login: string) => ({
  __typename: 'User',
  id: `id-${login}`,
  login,
  avatarUrl: `https://avatars/${login}`,
  name: null,
  createdAt: '2020-01-01T00:00:00Z',
  followers: { totalCount: 10 },
  socialAccounts: { nodes: [{ provider: 'TWITTER', displayName: login }] }
});

const connection = (items: unknown[], endCursor: string | null, hasNextPage: boolean, key = 'nodes') => ({
  node: { connection: { pageInfo: { hasNextPage, endCursor }, [key]: items } }
});

const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

function setup(handler: (request: Request) => Response) {
  const requests: Request[] = [];
  const fetcher = vi.fn<Fetcher>(async (_input, init) => {
    const request = JSON.parse(String(init?.body)) as Request;
    requests.push(request);
    return handler(request);
  });

  return { requests, service: new GithubService(new GithubClient('https://api.github.com', { fetcher })) };
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of iterable) result.push(item);
  return result;
}

describe('GithubService', () => {
  it('maps a repository and drops null fields', async () => {
    const { service, requests } = setup(() =>
      respond({
        data: {
          repository: {
            id: 'repo',
            name: 'name',
            nameWithOwner: 'owner/name',
            description: null,
            owner: { __typename: 'Organization', id: 'org', login: 'owner', avatarUrl: 'https://avatars/owner' },
            stargazerCount: 1,
            forkCount: 2,
            watchers: { totalCount: 3 },
            issues: { totalCount: 4 },
            pullRequests: { totalCount: 5 },
            releases: { totalCount: 6 },
            milestones: { totalCount: 7 },
            branches: { totalCount: 8 },
            defaultBranchRef: { target: { history: { totalCount: 9 } } }
          }
        }
      })
    );

    const repo = await service.repository('owner', 'name');

    expect(requests[0].variables).toEqual({ owner: 'owner', name: 'name' });
    expect(repo).toEqual({
      id: 'repo',
      name: 'name',
      name_with_owner: 'owner/name',
      owner: { __typename: 'Organization', id: 'org', login: 'owner', avatar_url: 'https://avatars/owner' },
      stargazers_count: 1,
      fork_count: 2,
      watchers_count: 3,
      issues_count: 4,
      pull_requests_count: 5,
      releases_count: 6,
      milestones_count: 7,
      branches_count: 8,
      commits_count: 9
    });
  });

  it('returns null for a repository that does not exist', async () => {
    const { service } = setup(() =>
      respond({ data: { repository: null }, errors: [{ type: 'NOT_FOUND', message: 'Could not resolve' }] })
    );

    await expect(service.repository('owner', 'missing')).resolves.toBeNull();
  });

  it('throws GithubError with the HTTP status', async () => {
    const { service } = setup(() => respond({ message: 'Bad credentials' }, 401));

    await expect(service.repository('owner', 'name')).rejects.toMatchObject({ name: 'GithubError', status: 401 });
  });

  it('throws on non-recoverable GraphQL errors', async () => {
    const { service } = setup(() => respond({ data: null, errors: [{ type: 'RATE_LIMITED', message: 'slow down' }] }));

    await expect(service.repository('owner', 'name')).rejects.toBeInstanceOf(GithubError);
  });

  it('paginates stargazers with cursors', async () => {
    const { service, requests } = setup(({ variables }) =>
      variables.after
        ? respond({ data: connection([{ starredAt: '2024-01-02T00:00:00Z', node: actor('b') }], 'c2', false, 'edges') })
        : respond({ data: connection([{ starredAt: '2024-01-01T00:00:00Z', node: actor('a') }], 'c1', true, 'edges') })
    );

    const pages = await collect(service.resources('stargazers', { repository: 'repo' }));

    expect(requests.map((r) => r.variables)).toEqual([
      { id: 'repo', first: 100 },
      { id: 'repo', first: 100, after: 'c1' }
    ]);
    expect(pages.map((p) => p.metadata)).toEqual([{ has_more: true, cursor: 'c1' }, { has_more: false }]);
    expect(pages[0].data[0]).toEqual({
      repository: 'repo',
      starred_at: new Date('2024-01-01T00:00:00Z'),
      user: {
        __typename: 'User',
        id: 'id-a',
        login: 'a',
        avatar_url: 'https://avatars/a',
        created_at: new Date('2020-01-01T00:00:00Z'),
        followers_count: 10,
        social_accounts: { twitter: 'a' }
      }
    });
  });

  it('halves the page size when GitHub times out', async () => {
    const { service, requests } = setup(({ variables }) =>
      variables.first === 100 ? respond({}, 502) : respond({ data: connection([actor('a')], null, false) })
    );

    const pages = await collect(service.resources('watchers', { repository: 'repo' }));

    expect(requests.map((r) => r.variables.first)).toEqual([100, 50]);
    expect(pages[0].data.map((w) => w.user.login)).toEqual(['a']);
  });

  it('skips null nodes returned alongside FORBIDDEN errors', async () => {
    const { service } = setup(() =>
      respond({
        data: connection([null, actor('a')], null, false),
        errors: [{ type: 'FORBIDDEN', message: 'Resource protected by organization SAML enforcement' }]
      })
    );

    const [page] = await collect(service.resources('watchers', { repository: 'repo' }));

    expect(page.data.map((w) => w.user.login)).toEqual(['a']);
  });

  it('fetches reactions of releases', async () => {
    const release = (id: string, reactions: number) => ({
      id,
      name: null,
      tagName: `v-${id}`,
      createdAt: '2024-01-01T00:00:00Z',
      author: actor('author'),
      reactions: { totalCount: reactions }
    });

    const { service, requests } = setup(({ variables }) =>
      variables.id === 'repo'
        ? respond({ data: connection([release('r1', 1), release('r2', 0)], null, false) })
        : respond({
            data: connection(
              [{ id: 'x', content: 'THUMBS_UP', createdAt: '2024-01-02T00:00:00Z', user: actor('fan') }],
              null,
              false
            )
          })
    );

    const [page] = await collect(service.resources('releases', { repository: 'repo' }));

    expect(requests.map((r) => r.variables.id)).toEqual(['repo', 'r1']);
    expect(page.data[0].reactions?.map((r) => [r.content, r.user?.login])).toEqual([['thumbs_up', 'fan']]);
    expect(page.data[1].reactions).toBeUndefined();
  });
});