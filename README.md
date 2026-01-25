# Repo Insights

Web application for visualizing GitHub repository insights and trends.

## Prerequisites

- Node.js >= 20.0.0
- Yarn package manager
- Git with submodule support

## Initial Setup

This project depends on the [`@gittrends-app/core`](https://github.com/gittrends-app/core) library via git submodules.

### Clone with submodules

```bash
# Clone the repository with submodules
git clone --recursive https://github.com/gittrends-app/repo-insights.git
cd repo-insights

# Install dependencies (automatically installs core library dependencies)
yarn install
```

### Existing clone without submodules

If you already cloned without `--recursive`:

```bash
# Initialize and update submodules
git submodule update --init --recursive

# Install dependencies
yarn install
```

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

## Core Library Management

The core library is automatically managed during installation, but you can manually rebuild it if needed:

```bash
# Rebuild core library (useful after making changes to libs/core)
yarn build:core
```

### Updating core library

To update to the latest version of the core library:

```bash
cd libs/core
git pull origin main
cd ../..
git add libs/core
git commit -m "chore: update core library"
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
│   ├── entities/        # Data entities
│   ├── helpers/         # Utility functions
│   └── hooks/           # React hooks
├── libs/
│   └── core/            # Core library (git submodule)
├── public/              # Static assets
└── Dockerfile           # Container configuration
```

## License

MIT
