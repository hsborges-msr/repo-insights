# Repo Insights

Web application for visualizing GitHub repository insights and trends.

## Prerequisites

- Node.js >= 20.0.0
- Yarn package manager

## Initial Setup

```bash
git clone https://github.com/gittrends-app/repo-insights.git
cd repo-insights
yarn install
```

The GitHub data layer (GraphQL client, entities and caching) originally came from the [`@gittrends-app/core`](https://github.com/gittrends-app/core) submodule. Only the parts used by this app were incorporated into `src/`, so no submodule is required.

## Development

```bash
# Start Next.js development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

### Migration / Re-auth

If you previously signed in, note that the app's access token storage key was renamed to `__access_token`. Your browser's local data may not migrate automatically — you may need to sign in again. See `DOCS/CHANGELOG.md` for more context.

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
