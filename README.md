# Repo Insights

> [!IMPORTANT]
> **This project is archived and no longer maintained.**
>
> Repo Insights was built to explore open source projects through the people who interact with them,
> mainly their **stargazers** (who starred a repository and when), along with watchers and release reactions.
>
> GitHub has since restricted access to stargazer data: the API no longer lists who starred a repository
> (the GraphQL `stargazers` connection comes back empty and the REST `/repos/{owner}/{repo}/stargazers`
> endpoint returns `404`), even though the total star count is still available. Without that data the
> application lost its main purpose, so the repository was archived.
>
> The code remains available for reference. It still builds and runs, but stargazer-based views will be empty.

Web application for visualizing GitHub repository insights and trends.

## Prerequisites

- Node.js >= 20.0.0
- Yarn package manager

## Initial Setup

```bash
git clone https://github.com/hsborges-msr/repo-insights.git
cd repo-insights
yarn install
```

The GitHub data layer (GraphQL client, entities and caching) originally came from the [`@gittrends-app/core`](https://github.com/gittrends-app/core) submodule. Only the parts used by this app were incorporated into `src/`, so no submodule is required.

### Environment variables

Development defaults live in `.env.development`, which `yarn dev` loads automatically. Signing in, and therefore
any GitHub API access, requires a [GitHub OAuth App](https://github.com/settings/developers) with its homepage and
callback URLs set to `http://localhost:3000`:

- `NEXT_PUBLIC_BASE_URL`: public URL of the app (required)
- `NEXT_PUBLIC_GA_ID`: Google Analytics id (required, may be empty)
- `NEXT_PUBLIC_GH_CLIENT_ID` / `GH_CLIENT_ID`: OAuth App client id
- `GH_CLIENT_SECRET`: OAuth App client secret. Put it in the git-ignored `.env.development.local`.

`yarn build` runs in production mode and does not read `.env.development`, so set these variables in your shell or in a `.env` file when building.

## Development

```bash
# Start Next.js development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Testing

```bash
# Run tests
yarn test

# Run tests with coverage
yarn test:coverage
```

## Code Quality

```bash
# Lint code
yarn lint

# Lint and auto-fix
yarn lint:fix

# Format code
yarn format

# Verify (lint + build)
yarn verify
```

## Docker

```bash
# Build Docker image
docker build -t repo-insights .

# Run container
docker run -p 3000:3000 repo-insights
```

## Project Structure

```bash
repo-insights/
├── src/                  # Application source code
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── entities/        # Data entities (Zod schemas)
│   ├── helpers/         # Utility functions (github/: GraphQL client, service, cache)
│   └── hooks/           # React hooks
├── public/              # Static assets
└── Dockerfile           # Container configuration
```

## License

MIT
