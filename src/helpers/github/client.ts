export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type GraphqlError = { type?: string; message: string };

// GraphQL errors that still come with usable (partial) data
const RECOVERABLE_ERRORS = ['NOT_FOUND', 'FORBIDDEN', 'SERVICE_UNAVAILABLE'];

/**
 * Error raised when a GitHub GraphQL request fails.
 */
export class GithubError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: GraphqlError[] = []
  ) {
    super(message);
    this.name = 'GithubError';
  }
}

/**
 * Minimal client for the GitHub GraphQL API.
 */
export class GithubClient {
  private readonly token?: string;
  private readonly fetcher: Fetcher;

  constructor(
    private readonly baseUrl: string = 'https://api.github.com',
    opts: { token?: string; fetcher?: Fetcher } = {}
  ) {
    this.token = opts.token;
    this.fetcher = opts.fetcher || fetch;
  }

  /**
   * Runs a GraphQL query. Null values are dropped from the response, so optional fields are simply absent
   * (null entries inside lists become holes and must be filtered by the caller).
   */
  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `bearer ${this.token}` } : {})
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new GithubError(`GitHub request failed with status ${response.status}.`, response.status);
    }

    const { data, errors = [] } = JSON.parse(await response.text(), (_key, value) =>
      value === null ? undefined : value
    ) as { data?: T; errors?: GraphqlError[] };

    if (errors.length > 0 && !(data && errors.every((error) => RECOVERABLE_ERRORS.includes(error.type ?? '')))) {
      throw new GithubError(errors.map((error) => error.message).join('\n'), response.status, errors);
    }

    return data as T;
  }
}