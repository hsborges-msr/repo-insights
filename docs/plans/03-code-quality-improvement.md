# Code Quality Improvement Plan

**Created:** January 24, 2026  
**Priority:** Medium  
**Estimated Effort:** 3-4 days  
**Impact:** Better code reliability, easier debugging, professional codebase

## Overview

This plan focuses on improving overall code quality through testing, linting fixes, documentation, error handling, and establishing development standards. The goal is to create a more robust, professional, and maintainable codebase.

## Current Code Quality Issues

### 1. No Test Coverage in src/

**Problem:** Zero test files in the main application code.

**Current State:**
- Only `libs/core/src/helpers/sanitize.spec.ts` exists
- No tests for React components
- No tests for custom hooks
- No tests for helper functions
- No tests for API routes

**Impact:** No safety net for refactoring, bugs caught only in production, harder to maintain confidence in changes.

### 2. Linting Warnings

**Problem:** Biome reports 3 instances of `noArrayIndexKey` violations.

**Locations:**
- `CacheManager.tsx:73` - Using index as key for database list
- `RepositoryTable.tsx:160` - Using index as key for table rows
- `RepositoryTable.tsx:174` - Using index as key for event display

**Impact:** Potential React reconciliation bugs, performance issues, state inconsistencies.

### 3. Limited Error Handling

**Problem:** Basic error handling without proper logging or user feedback.

**Issues:**
- No error boundary in root layout
- API errors not logged for monitoring
- Generic error messages shown to users
- No error tracking service integration (Sentry, etc.)

**Impact:** Hard to debug production issues, poor user experience, lost error insights.

### 4. Inconsistent Documentation

**Problem:** Inconsistent or missing documentation.

**Issues:**
- Some components have empty JSDoc comments (`/** */`)
- No usage examples for complex components
- No README files in component directories
- Helper functions lack parameter descriptions
- No architecture decision records (ADRs)

**Impact:** Harder for new developers to onboard, unclear component usage, forgotten architectural decisions.

### 5. No Accessibility Testing

**Problem:** No automated accessibility checks.

**Issues:**
- No axe-core or similar tool integration
- No aria-label testing
- No keyboard navigation tests
- Color contrast not verified programmatically

**Impact:** Potential accessibility violations, poor experience for users with disabilities, legal compliance risks.

## Refactoring Tasks

### Phase 1: Establish Testing Infrastructure (Priority: High)

#### Task 1.1: Set Up Testing Framework
**Goal:** Create comprehensive testing setup for React components and hooks.

**Action:**
1. Verify Vitest configuration for component testing
2. Install React Testing Library if needed
3. Create test utilities and helpers
4. Set up coverage thresholds

```bash
# Install dependencies (if not already present)
yarn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
yarn add -D @vitest/ui jsdom
```

**Create test utilities:**
```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { NextUIProvider } from '@heroui/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <NextUIProvider>{children}</NextUIProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

**Update vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './libs/core/src')
    }
  }
});
```

**Acceptance Criteria:**
- [ ] Testing framework configured
- [ ] Test utilities created
- [ ] Sample test runs successfully
- [ ] Coverage reporting works

**Estimated Time:** 2 hours

#### Task 1.2: Write Tests for Helper Functions
**Files:** All files in `src/helpers/`

**Test Coverage Plan:**

1. **src/helpers/actors.ts** (once created in maintainability plan)
```typescript
// src/helpers/actors.spec.ts
import { describe, it, expect } from 'vitest';
import { mergeActorData, getTopActors, filterActorsByEvent } from './actors';

describe('mergeActorData', () => {
  it('should merge actors from multiple sources', () => {
    const stars = [/* mock data */];
    const releases = [/* mock data */];
    const watchers = [/* mock data */];
    
    const result = mergeActorData(stars, releases, watchers);
    
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('events');
  });

  it('should combine events for the same user', () => {
    // Test event merging
  });

  it('should order actors by most recent event', () => {
    // Test ordering
  });
});

describe('getTopActors', () => {
  it('should return top N actors by event count', () => {
    // Test top actors
  });
});

describe('filterActorsByEvent', () => {
  it('should filter actors by event type', () => {
    // Test filtering
  });
});
```

2. **src/helpers/cache/browser.ts**
```typescript
// src/helpers/cache/browser.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { get, set } from 'idb-keyval';
import { vi } from 'vitest';

vi.mock('idb-keyval');

describe('BrowserCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set and get cached values', async () => {
    // Test caching
  });

  it('should respect TTL for cached values', async () => {
    // Test expiration
  });

  it('should compress large values', async () => {
    // Test compression
  });
});
```

3. **src/helpers/date.ts** (once created)
```typescript
// src/helpers/date.spec.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatRelative, formatUTC } from './date';

describe('date helpers', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    expect(formatDate(date)).toBe('January 1, 2024 12:00 PM');
  });

  it('should format relative time', () => {
    const date = new Date(Date.now() - 3600000); // 1 hour ago
    expect(formatRelative(date)).toBe('an hour');
  });
});
```

**Acceptance Criteria:**
- [ ] All helper functions have tests
- [ ] Edge cases covered
- [ ] Mock external dependencies
- [ ] 80%+ coverage for helpers

**Estimated Time:** 6 hours

#### Task 1.3: Write Tests for Custom Hooks
**Files:** All files in `src/hooks/`

**Test Examples:**

```typescript
// src/hooks/useTablePagination.spec.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTablePagination } from './useTablePagination';

describe('useTablePagination', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));

  it('should paginate items correctly', () => {
    const { result } = renderHook(() => useTablePagination(mockItems, 10));

    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.totalPages).toBe(10);
  });

  it('should change page', () => {
    const { result } = renderHook(() => useTablePagination(mockItems, 10));

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
    expect(result.current.paginatedItems[0].id).toBe(10);
  });

  it('should change items per page', () => {
    const { result } = renderHook(() => useTablePagination(mockItems, 10));

    act(() => {
      result.current.setPerPage(25);
    });

    expect(result.current.perPage).toBe(25);
    expect(result.current.paginatedItems).toHaveLength(25);
    expect(result.current.totalPages).toBe(4);
  });
});
```

```typescript
// src/hooks/useRepositoryData.spec.ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRepositoryData } from './useRepositoryData';

describe('useRepositoryData', () => {
  it('should return empty array when no data', () => {
    const { result } = renderHook(() => useRepositoryData(undefined, undefined, undefined));
    expect(result.current).toEqual([]);
  });

  it('should merge actor data correctly', () => {
    const stars = [/* mock */];
    const releases = [/* mock */];
    const watchers = [/* mock */];

    const { result } = renderHook(() => useRepositoryData(stars, releases, watchers));
    
    expect(result.current).toBeDefined();
    expect(result.current.length).toBeGreaterThan(0);
  });
});
```

**Acceptance Criteria:**
- [ ] All custom hooks tested
- [ ] State changes tested
- [ ] Side effects mocked
- [ ] 80%+ coverage for hooks

**Estimated Time:** 8 hours

#### Task 1.4: Write Component Tests
**Priority Components:** Pure components and complex logic components

**Test Examples:**

```typescript
// src/app/components/Footnote.spec.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Footnote from './Footnote';

describe('Footnote', () => {
  it('should render social links', () => {
    render(<Footnote />);
    
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
  });

  it('should have correct links', () => {
    render(<Footnote />);
    
    const githubLink = screen.getByLabelText('GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', expect.stringContaining('github.com'));
  });
});
```

```typescript
// src/app/components/SignInButton.spec.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import SignInButton from './SignInButton';

describe('SignInButton', () => {
  it('should render sign in button when not authenticated', () => {
    render(<SignInButton />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('should redirect to GitHub OAuth on click', () => {
    const windowOpen = vi.spyOn(window, 'location', 'get');
    render(<SignInButton />);
    
    const button = screen.getByText(/sign in/i);
    fireEvent.click(button);
    
    expect(window.location.href).toContain('github.com');
  });
});
```

**Acceptance Criteria:**
- [ ] Pure components tested
- [ ] User interactions tested
- [ ] Accessibility attributes verified
- [ ] 60%+ component coverage

**Estimated Time:** 12 hours

### Phase 2: Fix Linting Issues (Priority: High)

#### Task 2.1: Fix noArrayIndexKey Violations
**Files:** `CacheManager.tsx`, `RepositoryTable.tsx`

**Issue 1: CacheManager.tsx:73**
```typescript
// Before
databases.value?.map((db, index) => (
  <li key={index}>

// After - Use stable ID
databases.value?.map((db) => (
  <li key={db.name}>
```

**Issue 2: RepositoryTable.tsx:160**
```typescript
// Before
{items.map((item, index) => {
  const user = item as User;
  return (
    <TableRow key={index}>

// After - Use user ID
{items.map((item) => {
  const user = item as User;
  return (
    <TableRow key={user.id}>
```

**Issue 3: RepositoryTable.tsx:174**
```typescript
// Before
.map((s, index) => (
  <div key={index} className="text-xs">

// After - Use event type as key (assuming unique in this context)
.map(([event, count]) => (
  <div key={event} className="text-xs">
    {event}: {count}
  </div>
))
```

**Acceptance Criteria:**
- [ ] All noArrayIndexKey violations fixed
- [ ] Use stable, unique keys
- [ ] No lint warnings
- [ ] Functionality preserved

**Estimated Time:** 1 hour

### Phase 3: Improve Error Handling (Priority: Medium)

#### Task 3.1: Add Root Error Boundary
**File:** `src/app/layout.tsx`

**Action:**
Create error boundary component:

```typescript
// src/app/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@heroui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // TODO: Send to Sentry or similar service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-gray-600">We're sorry for the inconvenience.</p>
          <pre className="p-4 bg-gray-100 rounded text-sm max-w-2xl overflow-auto">
            {this.state.error?.message}
          </pre>
          <Button
            color="primary"
            onPress={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
          >
            Go to Home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Update layout:
```typescript
// src/app/layout.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Acceptance Criteria:**
- [ ] Error boundary in root layout
- [ ] Graceful error UI
- [ ] Error logging prepared
- [ ] Reset functionality works

**Estimated Time:** 2 hours

#### Task 3.2: Improve API Error Handling
**File:** `src/app/api/auth/github/access_token/route.ts`

**Action:**
```typescript
// Before
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const response = await fetch(/* ... */);
  const data = await response.json();

  return Response.json(data);
}

// After
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    const response = await fetch(/* ... */);
    
    if (!response.ok) {
      // Log error for monitoring
      console.error('GitHub OAuth error:', {
        status: response.status,
        statusText: response.statusText
      });
      
      return NextResponse.json(
        { error: 'Failed to exchange code for token' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Log successful auth (without token)
    console.info('OAuth successful for code:', code.slice(0, 5) + '...');

    return NextResponse.json(data);
  } catch (error) {
    console.error('OAuth route error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Proper error responses
- [ ] Errors logged
- [ ] User-friendly error messages
- [ ] Status codes correct

**Estimated Time:** 1 hour

#### Task 3.3: Create Centralized Error Types
**File:** `src/entities/errors.ts`

**Action:**
```typescript
// src/entities/errors.ts

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * API-related errors
 */
export class ApiError extends AppError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, 'API_ERROR', statusCode, details);
    this.name = 'ApiError';
  }
}

/**
 * GitHub API specific errors
 */
export class GitHubApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GitHubApiError';
  }

  static isRateLimitError(error: unknown): boolean {
    return error instanceof GitHubApiError && error.statusCode === 429;
  }

  static isUnauthorized(error: unknown): boolean {
    return error instanceof GitHubApiError && error.statusCode === 401;
  }
}

/**
 * Cache-related errors
 */
export class CacheError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'CACHE_ERROR', 500, details);
    this.name = 'CacheError';
  }
}

/**
 * Type guards
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Error formatter for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
```

**Acceptance Criteria:**
- [ ] Centralized error types
- [ ] Type guards for error checking
- [ ] Error formatting utilities
- [ ] Used throughout codebase

**Estimated Time:** 2 hours

### Phase 4: Improve Documentation (Priority: Medium)

#### Task 4.1: Add JSDoc to All Exports
**Files:** All exported functions and components

**Guidelines:**
```typescript
/**
 * Merges actor data from multiple sources into a unified list
 * 
 * Combines stargazers, release authors, watchers, and reaction users
 * into a single array of actors with all their events.
 * 
 * @param stars - Array of stargazer objects from GitHub API
 * @param releases - Array of release objects from GitHub API
 * @param watchers - Array of watcher objects from GitHub API
 * @returns Array of merged actors sorted by most recent event
 * 
 * @example
 * ```typescript
 * const actors = mergeActorData(stars, releases, watchers);
 * console.log(actors[0].events); // All events for first actor
 * ```
 */
export function mergeActorData(
  stars: Stargazer[],
  releases: Release[],
  watchers: Watcher[]
): ActorInfo[] {
  // Implementation
}
```

**Acceptance Criteria:**
- [ ] All exported functions documented
- [ ] Parameters described
- [ ] Return values described
- [ ] Examples provided for complex functions
- [ ] Component props documented

**Estimated Time:** 4 hours

#### Task 4.2: Create Component README Files
**Files:** Major component directories

**Template:**
```markdown
# ComponentName

## Overview
Brief description of what this component does.

## Usage

\```typescript
import ComponentName from './ComponentName';

function Example() {
  return <ComponentName prop1="value" prop2={123} />;
}
\```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| prop1 | string | Yes | - | Description |
| prop2 | number | No | 0 | Description |

## Examples

### Basic Usage
\```typescript
<ComponentName prop1="example" />
\```

### Advanced Usage
\```typescript
<ComponentName 
  prop1="example"
  prop2={42}
  onEvent={handleEvent}
/>
\```

## Testing

Run tests:
\```bash
npm test ComponentName.spec.tsx
\```

## Notes
- Important implementation details
- Known limitations
- Future improvements
```

**Acceptance Criteria:**
- [ ] README for each major component directory
- [ ] Usage examples provided
- [ ] Props documented
- [ ] Testing instructions included

**Estimated Time:** 3 hours

#### Task 4.3: Create Architecture Decision Records
**Directory:** `docs/adr/`

**Purpose:** Document important architectural decisions

**Template:**
```markdown
# ADR-001: Use Zustand for Global State Management

## Status
Accepted

## Context
We need a state management solution for global application state like user authentication.

## Decision
We will use Zustand with localStorage persistence for global state.

## Consequences

### Positive
- Lightweight (small bundle size)
- Simple API
- Built-in persistence
- TypeScript support

### Negative
- Less ecosystem than Redux
- No DevTools integration out of box

## Alternatives Considered
- Redux Toolkit
- Jotai
- React Context only
```

**Initial ADRs to Create:**
1. State management choice (Zustand)
2. Styling approach (Tailwind + HeroUI)
3. Data fetching strategy (SWR + custom hooks)
4. Caching strategy (IndexedDB + compression)
5. Monorepo structure (libs/core as submodule)

**Acceptance Criteria:**
- [ ] At least 5 ADRs documented
- [ ] Template established
- [ ] ADRs linked from main README

**Estimated Time:** 3 hours

### Phase 5: Add Accessibility Testing (Priority: Low)

#### Task 5.1: Integrate axe-core
**Goal:** Automated accessibility testing

**Action:**
```bash
yarn add -D @axe-core/react
```

```typescript
// src/app/layout.tsx (development only)
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

For testing:
```typescript
// src/test/setup.ts
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

```typescript
// In component tests
import { axe } from 'jest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Acceptance Criteria:**
- [ ] axe-core integrated
- [ ] Accessibility tests for key components
- [ ] No critical violations
- [ ] CI checks for a11y

**Estimated Time:** 3 hours

## Quality Metrics

### Before Implementation
- [ ] Test coverage: __% (likely 0%)
- [ ] Linting warnings: 3
- [ ] Documentation coverage: Low
- [ ] Accessibility score: Unknown

### Target After Implementation
- [ ] Test coverage: 70%+ overall, 80%+ for utils
- [ ] Linting warnings: 0
- [ ] Documentation coverage: 90%+
- [ ] Accessibility score: 90+ (Lighthouse)

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: yarn install
      - run: yarn test:coverage
      - run: yarn lint
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: http://localhost:3000
          budgetPath: .lighthouserc.json
```

**Acceptance Criteria:**
- [ ] CI runs tests on every PR
- [ ] Coverage reports uploaded
- [ ] Accessibility checks automated
- [ ] Build fails on test failures

**Estimated Time:** 2 hours

## Success Criteria

- [ ] 70%+ test coverage achieved
- [ ] Zero linting warnings
- [ ] All public APIs documented
- [ ] Error boundaries implemented
- [ ] Accessibility score 90+
- [ ] CI/CD pipeline running
- [ ] 5+ ADRs created

## Timeline

- **Week 1:** Phase 1 (Tasks 1.1-1.2) + Phase 2
- **Week 2:** Phase 1 (Tasks 1.3-1.4) + Phase 3
- **Week 3:** Phase 4 + Phase 5 + CI/CD

## Next Steps

1. Review and approve this plan
2. Set up testing infrastructure (Task 1.1)
3. Fix linting issues (Phase 2 - quick wins)
4. Start writing tests for helpers (Task 1.2)
5. Expand test coverage gradually

---

**Last Updated:** January 24, 2026
