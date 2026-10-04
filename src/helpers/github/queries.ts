const ACTOR_FRAGMENT = `
  fragment ActorFields on Actor {
    __typename
    ... on Node { id }
    login
    avatarUrl
    ... on User {
      name
      email
      company
      location
      createdAt
      isHireable
      isGitHubStar
      isCampusExpert
      followers { totalCount }
      following { totalCount }
      socialAccounts(first: 100) { nodes { provider displayName } }
    }
  }
`;

const PAGE_INFO = 'pageInfo { hasNextPage endCursor }';

export const VIEWER_QUERY = `
  query { viewer { ...ActorFields } }
  ${ACTOR_FRAGMENT}
`;

export const REPOSITORY_QUERY = `
  query ($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      nameWithOwner
      description
      owner { ...ActorFields }
      stargazerCount
      forkCount
      watchers { totalCount }
      issues { totalCount }
      pullRequests { totalCount }
      releases { totalCount }
      milestones { totalCount }
      branches: refs(refPrefix: "refs/heads/") { totalCount }
      defaultBranchRef { target { ... on Commit { history { totalCount } } } }
    }
  }
  ${ACTOR_FRAGMENT}
`;

export const STARGAZERS_QUERY = `
  query ($id: ID!, $first: Int!, $after: String) {
    node(id: $id) {
      ... on Repository {
        connection: stargazers(first: $first, after: $after, orderBy: { field: STARRED_AT, direction: ASC }) {
          ${PAGE_INFO}
          edges { starredAt node { ...ActorFields } }
        }
      }
    }
  }
  ${ACTOR_FRAGMENT}
`;

export const WATCHERS_QUERY = `
  query ($id: ID!, $first: Int!, $after: String) {
    node(id: $id) {
      ... on Repository {
        connection: watchers(first: $first, after: $after) {
          ${PAGE_INFO}
          nodes { ...ActorFields }
        }
      }
    }
  }
  ${ACTOR_FRAGMENT}
`;

export const RELEASES_QUERY = `
  query ($id: ID!, $first: Int!, $after: String) {
    node(id: $id) {
      ... on Repository {
        connection: releases(first: $first, after: $after, orderBy: { field: CREATED_AT, direction: ASC }) {
          ${PAGE_INFO}
          nodes {
            id
            name
            tagName
            createdAt
            publishedAt
            author { ...ActorFields }
            reactions { totalCount }
          }
        }
      }
    }
  }
  ${ACTOR_FRAGMENT}
`;

export const REACTIONS_QUERY = `
  query ($id: ID!, $first: Int!, $after: String) {
    node(id: $id) {
      ... on Reactable {
        connection: reactions(first: $first, after: $after) {
          ${PAGE_INFO}
          nodes { id content createdAt user { ...ActorFields } }
        }
      }
    }
  }
  ${ACTOR_FRAGMENT}
`;