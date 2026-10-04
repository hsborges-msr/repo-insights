import snakeCase from 'lodash-es/snakeCase';
import { Actor, ActorSchema } from '@/entities/Actor';
import { Reaction, ReactionSchema } from '@/entities/Reaction';
import { Release, ReleaseSchema } from '@/entities/Release';
import { Repository, RepositorySchema } from '@/entities/Repository';
import { Stargazer, StargazerSchema } from '@/entities/Stargazer';
import { Watcher, WatcherSchema } from '@/entities/Watcher';
import { GithubClient, GithubError } from './client';
import {
  REACTIONS_QUERY,
  RELEASES_QUERY,
  REPOSITORY_QUERY,
  STARGAZERS_QUERY,
  VIEWER_QUERY,
  WATCHERS_QUERY
} from './queries';

export type ResourceMap = {
  stargazers: Stargazer;
  releases: Release;
  watchers: Watcher;
};

export type Resource = keyof ResourceMap;

export type ResourceParams = {
  /** The repository node id. */
  repository: string;
  /** The cursor to resume from. */
  cursor?: string;
  per_page?: number;
};

export type ResourcePage<T> = {
  data: T[];
  /** `cursor` is only present when `has_more` is true. */
  metadata: { cursor?: string; has_more: boolean };
  /** Whether the page was served from cache. */
  __cached?: boolean;
};

export type ResourceIterable<T> = AsyncIterable<ResourcePage<T>>;

/**
 * Repository data source used by the app.
 */
export interface Service {
  repository(owner: string, name: string): Promise<Repository | null>;
  resources<R extends Resource>(resource: R, opts: ResourceParams): ResourceIterable<ResourceMap[R]>;
}

type Count = { totalCount: number };

type RawActor = {
  __typename: string;
  id: string;
  login: string;
  avatarUrl: string;
  name?: string;
  email?: string;
  company?: string;
  location?: string;
  createdAt?: string;
  isHireable?: boolean;
  isGitHubStar?: boolean;
  isCampusExpert?: boolean;
  followers?: Count;
  following?: Count;
  socialAccounts?: { nodes: Array<{ provider: string; displayName: string }> };
};

type RawRepository = {
  id: string;
  name: string;
  nameWithOwner: string;
  description?: string;
  owner: RawActor;
  stargazerCount: number;
  forkCount: number;
  watchers: Count;
  issues: Count;
  pullRequests: Count;
  releases: Count;
  milestones: Count;
  branches: Count;
  defaultBranchRef?: { target?: { history?: Count } };
};

type RawRelease = {
  id: string;
  name?: string;
  tagName: string;
  createdAt: string;
  publishedAt?: string;
  author?: RawActor;
  reactions: Count;
};

type RawReaction = { id: string; content: string; createdAt: string; user?: RawActor };

type RawConnection<N> = {
  pageInfo: { hasNextPage: boolean; endCursor?: string };
  nodes?: N[];
  edges?: N[];
};

type Page<T> = { items: T[]; hasNextPage: boolean; endCursor?: string };

function toActor(actor: RawActor): Actor {
  const socialAccounts = (actor.socialAccounts?.nodes || [])
    .filter(Boolean)
    .map((account) => [snakeCase(account.provider), account.displayName]);

  return ActorSchema.parse({
    __typename: actor.__typename,
    id: actor.id,
    login: actor.login,
    avatar_url: actor.avatarUrl,
    name: actor.name,
    email: actor.email,
    company: actor.company,
    location: actor.location,
    created_at: actor.createdAt,
    followers_count: actor.followers?.totalCount,
    following_count: actor.following?.totalCount,
    social_accounts: socialAccounts.length > 0 ? Object.fromEntries(socialAccounts) : undefined,
    is_hireable: actor.isHireable,
    is_github_star: actor.isGitHubStar,
    is_campus_expert: actor.isCampusExpert
  });
}

function toRepository(repo: RawRepository): Repository {
  return RepositorySchema.parse({
    id: repo.id,
    name: repo.name,
    name_with_owner: repo.nameWithOwner,
    description: repo.description,
    owner: toActor(repo.owner),
    stargazers_count: repo.stargazerCount,
    watchers_count: repo.watchers.totalCount,
    fork_count: repo.forkCount,
    issues_count: repo.issues.totalCount,
    pull_requests_count: repo.pullRequests.totalCount,
    releases_count: repo.releases.totalCount,
    branches_count: repo.branches.totalCount,
    milestones_count: repo.milestones.totalCount,
    commits_count: repo.defaultBranchRef?.target?.history?.totalCount
  });
}

/**
 * Whether the error is a GitHub timeout that may succeed with a smaller page.
 */
function isTransient(error: unknown): boolean {
  return error instanceof GithubError && [500, 502, 504].includes(error.status);
}

/**
 * Iterates over a GitHub connection, halving the page size whenever GitHub times out.
 */
function paginate<T>(
  fetchPage: (first: number, after?: string) => Promise<Page<T>>,
  opts: { cursor?: string; per_page?: number }
): ResourceIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      let cursor = opts.cursor;
      let perPage = opts.per_page || 100;

      while (true) {
        let page: Page<T>;
        try {
          page = await fetchPage(perPage, cursor);
        } catch (error) {
          if (!isTransient(error) || perPage <= 1) throw error;
          perPage = Math.ceil(perPage / 2);
          continue;
        }

        const hasMore = page.hasNextPage && !!page.endCursor;
        yield { data: page.items, metadata: { has_more: hasMore, ...(hasMore ? { cursor: page.endCursor } : {}) } };

        if (!hasMore) return;
        cursor = page.endCursor;
      }
    }
  };
}

/**
 * Service backed by the GitHub GraphQL API.
 */
export class GithubService implements Service {
  constructor(private readonly client: GithubClient) {}

  async viewer(): Promise<Actor | null> {
    const { viewer } = await this.client.query<{ viewer?: RawActor }>(VIEWER_QUERY);
    return viewer ? toActor(viewer) : null;
  }

  async repository(owner: string, name: string): Promise<Repository | null> {
    const { repository } = await this.client.query<{ repository?: RawRepository }>(REPOSITORY_QUERY, { owner, name });
    return repository ? toRepository(repository) : null;
  }

  resources<R extends Resource>(resource: R, opts: ResourceParams): ResourceIterable<ResourceMap[R]> {
    const id = opts.repository;

    switch (resource) {
      case 'stargazers':
        return paginate(
          (first, after) =>
            this.connection<{ starredAt: string; node: RawActor }, Stargazer>(
              STARGAZERS_QUERY,
              { id, first, after },
              (edge) => StargazerSchema.parse({ repository: id, starred_at: edge.starredAt, user: toActor(edge.node) })
            ),
          opts
        ) as ResourceIterable<ResourceMap[R]>;
      case 'watchers':
        return paginate(
          (first, after) =>
            this.connection<RawActor, Watcher>(WATCHERS_QUERY, { id, first, after }, (actor) =>
              WatcherSchema.parse({ repository: id, user: toActor(actor) })
            ),
          opts
        ) as ResourceIterable<ResourceMap[R]>;
      case 'releases':
        return paginate((first, after) => this.releases(id, first, after), opts) as ResourceIterable<ResourceMap[R]>;
      default:
        throw new Error(`Repository resource "${resource}" not implemented.`);
    }
  }

  private async releases(id: string, first: number, after?: string): Promise<Page<Release>> {
    const page = await this.connection<RawRelease, RawRelease>(RELEASES_QUERY, { id, first, after }, (r) => r);

    const items = await Promise.all(
      page.items.map(async (release) =>
        ReleaseSchema.parse({
          id: release.id,
          repository: id,
          name: release.name,
          tag_name: release.tagName,
          created_at: release.createdAt,
          published_at: release.publishedAt,
          author: release.author && toActor(release.author),
          reactions_count: release.reactions.totalCount,
          reactions: release.reactions.totalCount > 0 ? await this.reactions(release.id, first) : undefined
        })
      )
    );

    return { ...page, items };
  }

  private async reactions(id: string, first: number): Promise<Reaction[]> {
    const reactions: Reaction[] = [];

    const it = paginate(
      (first, after) =>
        this.connection<RawReaction, Reaction>(REACTIONS_QUERY, { id, first, after }, (reaction) =>
          ReactionSchema.parse({
            id: reaction.id,
            content: reaction.content.toLowerCase(),
            created_at: reaction.createdAt,
            user: reaction.user && toActor(reaction.user)
          })
        ),
      { per_page: first }
    );

    for await (const { data } of it) reactions.push(...data);

    return reactions;
  }

  /**
   * Fetches one page of a connection aliased as `connection` under `node(id: $id)`.
   */
  private async connection<N, T>(
    query: string,
    variables: { id: string; first: number; after?: string },
    map: (node: N) => T
  ): Promise<Page<T>> {
    const { node } = await this.client.query<{ node?: { connection?: RawConnection<N> } }>(query, variables);

    // missing node (e.g. deleted repository): nothing to iterate over
    if (!node?.connection) return { items: [], hasNextPage: false };

    const { pageInfo, nodes, edges } = node.connection;
    return {
      items: (nodes || edges || []).filter(Boolean).map(map),
      hasNextPage: pageInfo.hasNextPage,
      endCursor: pageInfo.endCursor
    };
  }
}