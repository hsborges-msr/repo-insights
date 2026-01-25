# Agent Guidelines for Repo Insights

This document provides essential information for AI coding agents working in this repository.

## Project Overview

A Next.js 16 application for visualizing GitHub repository insights and trends. Uses TypeScript, React 19, Biome for linting/formatting, Vitest for testing, and includes a git submodule for the core library at `libs/core`.

## Build, Lint, and Test Commands

### Development

```bash
yarn dev              # Start Next.js development server (port 3000)
yarn build            # Build for production (automatically builds core library)
yarn start            # Start production server
```

### Testing

```bash
yarn test             # Run all tests with Vitest
yarn test:coverage    # Run tests with coverage report
```

To run a **single test file**:

```bash
npx vitest run path/to/file.spec.ts
# Example: npx vitest run libs/core/src/helpers/sanitize.spec.ts
```

To run tests in **watch mode**:

```bash
npx vitest path/to/file.spec.ts
```

### Code Quality

```bash
yarn lint             # Lint code with Biome
yarn lint:fix         # Lint and auto-fix issues
yarn format           # Format code with Biome
yarn verify           # Run lint + build (CI verification)
```

### Core Library

```bash
cd libs/core && npm run build    # Manually rebuild core library
```

## Code Style Guidelines

### Formatting (Biome Configuration)

- **Indentation**: 2 spaces
- **Line width**: 120 characters
- **Line endings**: LF (Unix)
- **Quotes**: Single quotes for JS/TS, double quotes for JSX
- **Semicolons**: Always required
- **Trailing commas**: Never
- **Arrow parentheses**: Always use parentheses `(x) => x`

### Import Organization

Imports should be organized and auto-sorted by Biome. Order:

1. External dependencies (React, Next.js, third-party)
2. Internal aliases (`@/` paths)
3. Relative imports

Example:

```typescript
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Cache, GithubService } from '@/core';
import { createService } from '@/helpers/github/base';
```

### TypeScript Guidelines

- **Target**: ESNext with ES2022 lib
- **Module**: ESNext with node resolution
- **Strict mode**: Enabled (inherited from @tsconfig/node20)
- **Path aliases**:
  - `@/*` maps to `src/*`
  - `@/core` maps to `libs/core/src`

### Type Safety Rules

- **No `any`**: Explicit `any` types are errors (`noExplicitAny: "error"`)
- Use `// biome-ignore lint/suspicious/noExplicitAny: <reason>` when absolutely necessary
- **No console**: Console statements are errors in production code
- Use type imports when appropriate (though `useImportType` is disabled)
- Avoid non-null assertions unless certain (rule is disabled)

### Naming Conventions

- **Files**: Use PascalCase for React components (`SignInButton.tsx`), camelCase for utilities (`sanitize.ts`)
- **Components**: PascalCase with default exports
- **Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for env vars, camelCase for regular constants

### React/Next.js Patterns

- Use `'use client'` directive for client components (not needed in `app/` route files)
- Prefer functional components with hooks
- Use Next.js 16 App Router conventions
- Component documentation with JSDoc:

  ```typescript
  /**
   *  ComponentName description
   */
  export default function ComponentName() {
  ```

### Error Handling

- Use Zod schemas for runtime validation (see `src/helpers/env/browser.ts`)
- Parse environment variables with Zod at module load
- Handle API errors gracefully with appropriate user feedback
- Use TypeScript's type system to prevent errors at compile time

### State Management

- React hooks (`useState`, `useEffect`, etc.) for local state
- Zustand for global state
- SWR for data fetching and caching
- Custom cache implementation using IndexedDB (see `src/helpers/cache/browser.ts`)

### Styling

- Tailwind CSS with HeroUI component library
- Use `twMerge` for merging Tailwind classes
- Responsive design with mobile-first approach (`max-sm:` breakpoints)

### Testing

- Use Vitest as the test runner
- Test files: `*.spec.ts` or `*.test.ts`
- Place tests adjacent to source files in `libs/core`
- Use descriptive test names: `it('should remove null values at root', () => ...)`

### Commit Message Convention

Follow Conventional Commits with these allowed types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or updates
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes
- `ticket`: Ticket-related changes
- `revert`: Revert previous changes

Example: `feat: add repository comparison feature`

## File Structure

```txt
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── components/        # Shared React components
│   ├── r/[owner]/[name]/ # Dynamic repository route
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── entities/              # Type definitions and data models
├── helpers/               # Utility functions
│   ├── cache/            # Caching implementations
│   ├── env/              # Environment variable handling
│   └── github/           # GitHub API service creators
├── hooks/                 # Custom React hooks
└── providers/             # React context providers

libs/core/                 # Git submodule - GitHub API client library
```

## Important Notes

- **Node version**: >= 20.0.0 required
- **Package manager**: Use Yarn (not npm)
- **Module system**: ESM only (`"type": "module"`)
- **Core library**: Automatically installed via preinstall hook, builds before main build
- **Git submodules**: Run `git submodule update --init --recursive` if missing
- **Accessibility**: Click event rules disabled for JSX (`useKeyWithClickEvents: "off"`)
- **Dependencies**: Check exhaustive deps disabled for performance in some cases

## Key Dependencies

- **Framework**: Next.js 16.1.1, React 19.2.3
- **UI**: HeroUI 2.8.7, Tailwind CSS 4.1.18, Framer Motion
- **Data**: SWR, Zustand, Zod 4.2.1
- **GitHub**: Custom client in @gittrends-app/core
- **Testing**: Vitest 4.0.16
- **Tooling**: Biome 2.3.10, TypeScript 5.8.2

## Maintaining This Document

This document serves as the primary reference for AI coding agents working in this repository. Keeping it up-to-date ensures consistent code quality and efficient collaboration.

### When to Update AGENTS.md

Update this document when any of the following changes occur:

1. **Build System Changes**
   - New scripts added to `package.json`
   - Changes to build, test, or lint commands
   - Modifications to the development workflow

2. **Configuration Updates**
   - Changes to Biome, TypeScript, or other tool configurations
   - Updates to formatting rules or code style preferences
   - Modifications to linting rules or severity levels

3. **Dependency Updates**
   - Major or minor version updates to key dependencies (Next.js, React, etc.)
   - Addition or removal of significant libraries
   - Changes to the tech stack or architectural decisions

4. **Code Standards Evolution**
   - New coding patterns or best practices adopted
   - Changes to naming conventions
   - Updates to project structure or file organization
   - New testing patterns or requirements

5. **Project Structure Changes**
   - Addition or removal of major directories
   - Refactoring of the folder structure
   - Changes to import path aliases

6. **Workflow Changes**
   - Updates to commit message conventions
   - Changes to branching strategy or git workflow
   - New development or deployment processes

7. **Environment Changes**
   - Node version requirements
   - New environment variables or configuration files
   - Changes to tooling or editor requirements

### Update Guidelines

- Keep descriptions concise and actionable
- Include examples where helpful
- Update version numbers when dependencies change
- Remove outdated information promptly
- Verify all commands and examples work correctly

---

**Last Updated**: January 24, 2026
