# Maintainability Refactoring Plan

**Created:** January 24, 2026  
**Priority:** High  
**Estimated Effort:** 5-7 days  
**Impact:** Improved code organization, easier maintenance, better developer experience

## Overview

This plan focuses on improving code maintainability through component splitting, reducing complexity, eliminating duplication, and establishing reusable patterns. The goal is to make the codebase easier to understand, modify, and extend.

## Current Maintainability Issues

### 1. Large, Complex Components

**Problem:** Several components exceed 150 lines with multiple responsibilities.

**Affected Components:**
- `RepositoryTable.tsx` (227 lines) - Table logic + pagination + sorting + download + details toggle
- `page.tsx` (163 lines) - Data fetching + aggregation + progress tracking + UI rendering
- `RepositoryStatistics.tsx` (195 lines) - Three separate charts in one file
- `StargazersGraph.tsx` (191 lines) - Chart rendering + controls + data transformation
- `Header.tsx` (140 lines) - Navigation + OAuth + search + cache modal + user menu

**Impact:** Hard to test, difficult to understand, high cognitive load, violates Single Responsibility Principle.

### 2. Code Duplication

**Problem:** Similar patterns repeated across multiple files.

**Patterns Identified:**
- **dayjs configuration** (5 files) - Each file imports and configures plugins separately
- **Data transformation logic** (3 files) - Actor data processing duplicated
- **Number formatting** (6 files) - numeral patterns repeated
- **lodash patterns** (5 files) - Similar groupBy, orderBy, flatten usage

**Impact:** Changes require updates in multiple places, increased bundle size, inconsistent behavior.

### 3. Complex Custom Hooks

**Problem:** `useResources.ts` has 110 lines with complex state management and side effects.

**Issues:**
- Multiple useState hooks (data, loading, error)
- Complex useEffect with AbortController, async iteration, state batching
- Uses `@ts-expect-error` to bypass type checking (line 66)
- Mixes concerns: caching, pagination, streaming, error handling

**Impact:** Hard to test, difficult to debug, hard to modify without breaking things.

### 4. Type Safety Issues

**Problem:** 15 instances of type safety bypasses across the codebase.

**Locations:**
- `useResources.ts:66` - @ts-expect-error for service method call
- `BrowserCache:34` - `any` type with biome-ignore
- `RepositoryStatistics.tsx` - 3 instances of `any` for ECharts params
- `RepositoryError.tsx:8` - `any` for error type

**Impact:** Runtime errors not caught by TypeScript, harder to refactor safely.

## Refactoring Tasks

### Phase 1: Split Large Components (Priority: High)

#### Task 1.1: Split RepositoryTable into Multiple Components
**File:** `RepositoryTable.tsx` (227 lines)

**Current Structure:**
```
RepositoryTable
├── Table rendering
├── Pagination logic
├── Sorting logic
├── Details toggle
└── Download functionality
```

**Proposed Structure:**
```
src/app/r/[owner]/[name]/components/
├── RepositoryTable/
│   ├── index.tsx (main component, 80 lines)
│   ├── TableControls.tsx (pagination + per page selector, 40 lines)
│   ├── TableBottomBar.tsx (total count + details + download, 30 lines)
│   ├── UserTableRow.tsx (single row rendering, 60 lines)
│   └── hooks/
│       ├── useTablePagination.ts (pagination logic, 20 lines)
│       └── useTableSorting.ts (sorting logic, 30 lines)
```

**Implementation:**

Create `src/app/r/[owner]/[name]/components/RepositoryTable/hooks/useTablePagination.ts`:
```typescript
import { useState, useMemo } from 'react';

export function useTablePagination<T>(items: T[], initialPerPage = 10) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const totalPages = Math.ceil(items.length / perPage);

  return {
    page,
    setPage,
    perPage,
    setPerPage,
    paginatedItems,
    totalPages
  };
}
```

Create `src/app/r/[owner]/[name]/components/RepositoryTable/hooks/useTableSorting.ts`:
```typescript
import { useState, useMemo } from 'react';
import { SortDescriptor } from '@heroui/react';
import orderBy from 'lodash-es/orderBy';
import { Actor } from '@/core';

export function useTableSorting<T extends Actor>(items: T[]) {
  const [descriptor, setDescriptor] = useState<SortDescriptor[]>([]);

  const sortedItems = useMemo(() => {
    if (!descriptor.length) return items;

    return orderBy(
      items,
      descriptor.map((desc) =>
        desc.column === 'events' ? (e) => e.events.length : (e) => e[desc.column as keyof Actor] ?? ''
      ),
      descriptor.map((desc) => (desc.direction === 'ascending' ? 'asc' : 'desc'))
    );
  }, [items, descriptor]);

  const handleSortChange = ({ column, direction }: { column: string; direction: string }) => {
    setDescriptor([
      { column, direction: column !== descriptor.at(0)?.column ? 'descending' : direction },
      ...descriptor.filter((d) => d.column !== column)
    ]);
  };

  return {
    descriptor: descriptor.at(0),
    sortedItems,
    handleSortChange
  };
}
```

Create `src/app/r/[owner]/[name]/components/RepositoryTable/UserTableRow.tsx`:
```typescript
import { TableRow, TableCell, Checkbox, Link } from '@heroui/react';
import { User as UserAvatar } from '@heroui/react';
import { IconMail } from '@tabler/icons-react';
import dayjs from 'dayjs';
import countBy from 'lodash-es/countBy';
import Link from 'next/link';
import numeral from 'numeral';
import { User } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import { SocialPlatforms } from '@/helpers/social';

interface UserTableRowProps {
  user: ActorInfo;
  showDetails: boolean;
}

export default function UserTableRow({ user, showDetails }: UserTableRowProps) {
  const typedUser = user as User;

  return (
    <TableRow key={typedUser.id}>
      <TableCell>
        <div className="flex gap-3 items-center">
          <UserAvatar
            avatarProps={{ size: 'sm', src: typedUser.avatar_url, className: 'max-sm:w-7 max-sm:h-7' }}
            description={typedUser.name?.slice(0, 20)}
            name={<Link target="_blank" href={`https://github.com/${typedUser.login}`}>{`@${typedUser.login}`}</Link>}
          />
        </div>
      </TableCell>
      <TableCell>
        {Object.entries(countBy(user.events, 'type')).map(([event, count]) => (
          <div key={event} className="text-xs">
            {event}: {count}
          </div>
        ))}
      </TableCell>
      <TableCell>{numeral(typedUser.followers_count).format('0,0')}</TableCell>
      <TableCell>{numeral(typedUser.following_count).format('0,0')}</TableCell>
      <TableCell>
        <abbr title={`Created at ${dayjs(typedUser.created_at).format('LLL')}`}>
          {dayjs(typedUser.created_at).fromNow(true)}
        </abbr>
      </TableCell>
      <TableCell>{typedUser.company}</TableCell>
      <TableCell>{typedUser.location}</TableCell>
      <TableCell>
        <div className="flex gap-2 justify-center">
          {typedUser.social_accounts &&
            Object.entries(typedUser.social_accounts).map(([name, value]) => {
              if (!SocialPlatforms[name]) return null;
              const { Icon, url } = SocialPlatforms[name];

              return (
                <span key={name} className="flex justify-center items-center text-xm">
                  <Link href={`${url ? `${url}/` : ''}${value}`} target="_blank">
                    <Icon size="1.25em" />
                  </Link>
                </span>
              );
            })}
          {typedUser.email && (
            <span className="flex justify-center items-center text-xm">
              <Link href={`mailto:${typedUser.email}`} target="_blank">
                <IconMail size="1.25em" />
              </Link>
            </span>
          )}
        </div>
      </TableCell>
      <TableCell hidden={!showDetails}>
        <Checkbox isSelected={typedUser.is_hireable} isDisabled size="sm" color="default" />
      </TableCell>
      <TableCell hidden={!showDetails}>
        <Checkbox isSelected={typedUser.is_github_star} isDisabled size="sm" color="default" />
      </TableCell>
      <TableCell hidden={!showDetails}>
        <Checkbox isSelected={typedUser.is_campus_expert} isDisabled size="sm" color="default" />
      </TableCell>
    </TableRow>
  );
}
```

**Acceptance Criteria:**
- [ ] Component split into 5+ smaller files
- [ ] Each component has single responsibility
- [ ] Custom hooks extracted and reusable
- [ ] All functionality preserved
- [ ] Code easier to understand and test
- [ ] No duplicate code

**Estimated Time:** 6 hours

#### Task 1.2: Split page.tsx into Container/Presentation Pattern
**File:** `page.tsx` (163 lines)

**Current Issues:**
- Data fetching logic mixed with UI
- Complex useMemo for data aggregation (lines 41-74)
- Progress calculation logic inline

**Proposed Structure:**
```
src/app/r/[owner]/[name]/
├── page.tsx (main container, 80 lines)
├── components/
│   └── RepositoryPageView.tsx (presentational, 60 lines)
└── hooks/
    ├── useRepositoryData.ts (data aggregation, 40 lines)
    └── useCollectionProgress.ts (progress tracking, 30 lines)
```

Create `src/hooks/useRepositoryData.ts`:
```typescript
import { useMemo } from 'react';
import { Release, Stargazer, Watcher } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import { mergeActorData } from '@/helpers/actors';

export function useRepositoryData(
  stars?: Stargazer[],
  releases?: Release[],
  watchers?: Watcher[]
) {
  return useMemo<ActorInfo[]>(() => {
    if (!stars || !releases || !watchers) return [];
    return mergeActorData(stars, releases, watchers);
  }, [stars, releases, watchers]);
}
```

Create `src/hooks/useCollectionProgress.ts`:
```typescript
import { useMemo } from 'react';
import mapValues from 'lodash-es/mapValues';
import numeral from 'numeral';
import { Repository } from '@/core';
import { IterableAsyncState } from './useResources';

interface ProgressProps {
  repo?: Repository;
  stars: IterableAsyncState<any>;
  releases: IterableAsyncState<any>;
  watchers: IterableAsyncState<any>;
}

export function useCollectionProgress({ repo, stars, releases, watchers }: ProgressProps) {
  const progress = useMemo(
    () =>
      mapValues(
        {
          stargazers: stars.hasMore ? (stars.value?.length || 0) / (repo?.stargazers_count || 0) : 1,
          releases: releases.hasMore ? (releases.value?.length || 0) / (repo?.releases_count || 0) : 1,
          watchers: watchers.hasMore ? (watchers.value?.length || 0) / (repo?.watchers_count || 0) : 1
        },
        (v) => numeral(Math.min(1, v)).format('0.[00]%')
      ),
    [repo, stars, releases, watchers]
  );

  const hasMore = useMemo(() => stars.hasMore || releases.hasMore || watchers.hasMore, [stars, releases, watchers]);

  const isLoading = useMemo(
    () => stars.loading || releases.loading || watchers.loading,
    [stars, releases, watchers]
  );

  const error = useMemo(() => stars.error || releases.error || watchers.error, [stars, releases, watchers]);

  return { progress, hasMore, isLoading, error };
}
```

**Acceptance Criteria:**
- [ ] Data logic extracted to custom hooks
- [ ] Presentational component created
- [ ] Container component simplified
- [ ] Hooks are testable
- [ ] All functionality preserved

**Estimated Time:** 4 hours

#### Task 1.3: Split RepositoryStatistics into Separate Chart Components
**File:** `RepositoryStatistics.tsx` (195 lines)

**Current Structure:** Three charts in one file

**Proposed Structure:**
```
src/app/r/[owner]/[name]/components/
├── RepositoryStatistics/
│   ├── index.tsx (wrapper component, 30 lines)
│   ├── FollowersFollowingChart.tsx (60 lines)
│   ├── AccountAgeChart.tsx (60 lines)
│   └── AvailabilityChart.tsx (60 lines)
```

**Benefits:**
- Easier to maintain individual charts
- Can lazy load charts independently
- Clearer component boundaries
- Easier to test

**Acceptance Criteria:**
- [ ] Three separate chart components
- [ ] Each chart self-contained
- [ ] Data transformation logic in each chart
- [ ] All charts render correctly
- [ ] Consider lazy loading

**Estimated Time:** 3 hours

#### Task 1.4: Split StargazersGraph Controls
**File:** `StargazersGraph.tsx` (191 lines)

**Proposed Structure:**
```
src/app/r/[owner]/[name]/components/
├── StargazersGraph/
│   ├── index.tsx (main chart, 100 lines)
│   ├── StargazersControls.tsx (controls panel, 50 lines)
│   └── hooks/
│       └── useStargazersSeries.ts (data transformation, 50 lines)
```

**Acceptance Criteria:**
- [ ] Controls extracted to separate component
- [ ] Data processing in custom hook
- [ ] Main component simplified
- [ ] All functionality preserved

**Estimated Time:** 3 hours

#### Task 1.5: Split Header Component
**File:** `Header.tsx` (140 lines)

**Current Issues:**
- OAuth callback handling
- Cache modal state
- Navigation rendering
- Search functionality
- User menu

**Proposed Structure:**
```
src/app/components/Header/
├── index.tsx (main header, 60 lines)
├── UserMenu.tsx (user dropdown, 30 lines)
├── RepositorySearch.tsx (search input, 30 lines)
└── hooks/
    └── useOAuthCallback.ts (OAuth logic, 30 lines)
```

**Acceptance Criteria:**
- [ ] OAuth logic extracted to hook
- [ ] User menu as separate component
- [ ] Search as separate component
- [ ] Header component simplified
- [ ] All functionality works

**Estimated Time:** 3 hours

### Phase 2: Eliminate Code Duplication (Priority: High)

#### Task 2.1: Create Shared dayjs Configuration
**Files:** 5 files importing dayjs separately

**Action:**
Create `src/helpers/date.ts`:

```typescript
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeFormat from 'dayjs/plugin/relativeTime';
import utcTime from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// Configure all plugins once
dayjs.extend(localizedFormat);
dayjs.extend(relativeFormat);
dayjs.extend(utcTime);
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

// Export configured dayjs
export default dayjs;

// Export common formatting functions
export const formatDate = (date: Date | string, format = 'LLL') => dayjs(date).format(format);
export const formatRelative = (date: Date | string) => dayjs(date).fromNow(true);
export const formatUTC = (date: Date | string, format: string) => dayjs(date).utc().format(format);
```

Update all imports:
```typescript
// Before
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

// After
import dayjs from '@/helpers/date';
// or
import { formatDate, formatRelative } from '@/helpers/date';
```

**Acceptance Criteria:**
- [ ] Single dayjs configuration file
- [ ] All files use shared config
- [ ] Helper functions for common patterns
- [ ] Bundle size slightly reduced (deduped plugins)

**Estimated Time:** 2 hours

#### Task 2.2: Create Actor Data Transformation Utilities
**Files:** `page.tsx`, `RepositoryHighlights.tsx`, `RepositoryTable.tsx`

**Action:**
Create `src/helpers/actors.ts`:

```typescript
import flatten from 'lodash-es/flatten';
import groupBy from 'lodash-es/groupBy';
import orderBy from 'lodash-es/orderBy';
import { Actor, Reaction, Release, Stargazer, User, Watcher } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';

/**
 * Merge actor data from multiple sources (stars, releases, watchers)
 */
export function mergeActorData(
  stars: Stargazer[],
  releases: Release[],
  watchers: Watcher[]
): ActorInfo[] {
  const starred: ActorInfo[] = stars.map((s) => ({
    ...(s.user as User),
    events: [{ type: 'starred', date: s.starred_at }]
  }));

  const watched: ActorInfo[] = watchers.map((s) => ({
    ...(s.user as User),
    events: [{ type: 'watching', date: new Date(0) }]
  }));

  const released = releases
    .map((r) => (r.author ? { ...r.author, events: [{ type: 'release', date: r.created_at }] } : null))
    .filter((a) => a !== null) as ActorInfo[];

  const reacted = flatten(
    releases.map((r) => {
      return ((r.reactions || []) as Reaction[])?.map(
        (ra) =>
          ({
            ...(ra.user as Actor),
            events: [{ type: 'reaction', date: ra.created_at }]
          }) satisfies ActorInfo
      );
    })
  );

  const merged = Object.values(groupBy([...starred, ...released, ...watched, ...reacted], 'id')).map((rest) => ({
    ...rest.at(0),
    events: orderBy(flatten(rest.map((e) => e.events)), 'date', 'desc')
  }));

  return orderBy(merged, 'events.[0].date', 'desc') as ActorInfo[];
}

/**
 * Get top actors by event count
 */
export function getTopActors(actors: ActorInfo[], limit = 10): ActorInfo[] {
  return orderBy(actors, (a) => a.events.length, 'desc').slice(0, limit);
}

/**
 * Filter actors by event type
 */
export function filterActorsByEvent(actors: ActorInfo[], eventType: string): ActorInfo[] {
  return actors.filter((a) => a.events.some((e) => e.type === eventType));
}

/**
 * Count unique actors
 */
export function countUniqueActors(actors: ActorInfo[]): number {
  return new Set(actors.map((a) => a.id)).size;
}
```

**Acceptance Criteria:**
- [ ] Shared utility functions created
- [ ] All duplication removed
- [ ] Functions have JSDoc comments
- [ ] Unit tests added
- [ ] Used in all relevant components

**Estimated Time:** 3 hours

#### Task 2.3: Create Number Formatting Utilities
**Files:** 6 files using numeral

**Action:**
Create `src/helpers/format.ts`:

```typescript
import numeral from 'numeral';

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, format = '0,0'): string {
  return numeral(value).format(format);
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return numeral(value).format(`0.${'0'.repeat(decimals)}%`);
}

/**
 * Format large numbers with abbreviations (1K, 1M, etc.)
 */
export function formatCompact(value: number): string {
  return numeral(value).format('0.0a');
}

/**
 * Native alternative using Intl API (optional)
 */
export function formatNumberNative(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
```

**Acceptance Criteria:**
- [ ] Shared formatting utilities
- [ ] Consistent number formatting
- [ ] Easy to switch to native Intl API later
- [ ] Used across codebase

**Estimated Time:** 2 hours

### Phase 3: Simplify Complex Hooks (Priority: Medium)

#### Task 3.1: Refactor useResources Hook
**File:** `useResources.ts` (110 lines)

**Current Issues:**
- Too many responsibilities
- Complex state management
- Type safety bypass (@ts-expect-error)
- Hard to test

**Proposed Approach:**
Extract concerns into separate hooks and services:

```typescript
// src/hooks/useResourceFetcher.ts
export function useResourceFetcher<T>(
  fetchFn: () => AsyncIterator<T>,
  paused: boolean
) {
  // Handle fetching logic
}

// src/hooks/useStreamingData.ts
export function useStreamingData<T>(
  iterator: AsyncIterator<T>,
  batchSize: number
) {
  // Handle streaming and batching
}

// Simplified useResources
export default function useResources(...) {
  const fetcher = useResourceFetcher(...);
  const stream = useStreamingData(...);
  
  return {
    value: stream.data,
    loading: fetcher.loading,
    error: fetcher.error,
    hasMore: stream.hasMore,
    cached: stream.cached
  };
}
```

**Acceptance Criteria:**
- [ ] Hook split into smaller pieces
- [ ] Each piece has single responsibility
- [ ] Type safety improved
- [ ] Easier to test
- [ ] All functionality preserved

**Estimated Time:** 5 hours

### Phase 4: Improve Type Safety (Priority: Medium)

#### Task 4.1: Fix Type Safety Bypasses
**Files:** Multiple files with @ts-expect-error or any

**Actions:**

1. **Fix useResources type error (line 66)**
```typescript
// Before
// @ts-expect-error - This is a hack to avoid type errors
const it = createService(repo.name_with_owner, user?.__acess_token).resources(resource, {
  repository: repo.id,
  cursor: data.cursor || undefined
});

// After - Create proper types
interface ResourceIterator<T> {
  resources(
    type: 'stargazers' | 'releases' | 'watchers',
    options: { repository: string; cursor?: string }
  ): AsyncIterator<T>;
}

const service = createService(repo.name_with_owner, user?.__access_token) as ResourceIterator<T>;
const it = service.resources(resource, {
  repository: repo.id,
  cursor: data.cursor || undefined
});
```

2. **Create ECharts types**
```typescript
// src/entities/EChartsTypes.ts
export interface EChartsEvent {
  componentType: string;
  seriesType?: string;
  seriesIndex?: number;
  seriesName?: string;
  name: string;
  dataIndex: number;
  data: unknown;
  value: number | string;
  color: string;
}

export interface EChartsMouseEvent extends EChartsEvent {
  event: {
    offsetX: number;
    offsetY: number;
    target: EventTarget;
  };
}
```

3. **Create Error types**
```typescript
// src/entities/ApiError.ts
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export type AppError = Error | ApiError;

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}
```

**Acceptance Criteria:**
- [ ] No @ts-expect-error in codebase
- [ ] No any types (except truly dynamic data)
- [ ] Proper type definitions created
- [ ] Type guards where needed
- [ ] All type errors resolved

**Estimated Time:** 4 hours

#### Task 4.2: Fix Typo in Auth Token
**File:** `AuthProvider.tsx`, `useResources.ts`

**Action:**
```typescript
// Before
__acess_token

// After
__access_token
```

**Steps:**
1. Update type definition in AuthProvider
2. Update usage in useResources
3. Search for all occurrences
4. Test OAuth flow still works
5. Users will need to re-authenticate (clear localStorage)

**Acceptance Criteria:**
- [ ] Typo fixed in all locations
- [ ] OAuth flow tested and working
- [ ] Migration note added to CHANGELOG

**Estimated Time:** 1 hour

## Testing Strategy

### Unit Tests
- [ ] Test custom hooks in isolation
- [ ] Test utility functions
- [ ] Test data transformation logic
- [ ] Mock external dependencies

### Integration Tests
- [ ] Test component composition
- [ ] Test data flow through hooks
- [ ] Test user interactions

### Refactoring Tests
- [ ] Ensure no functionality breaks
- [ ] Compare before/after screenshots
- [ ] Test edge cases

## File Organization

### Before
```
src/
├── app/components/        (4 files)
├── app/r/.../components/  (9 files)
├── hooks/                 (3 files)
└── helpers/               (6 files)
```

### After
```
src/
├── app/components/
│   ├── Header/            (4 files)
│   └── ...
├── app/r/.../components/
│   ├── RepositoryTable/   (6 files)
│   ├── RepositoryStatistics/ (4 files)
│   ├── StargazersGraph/   (3 files)
│   └── ...
├── hooks/                 (8 files)
├── helpers/
│   ├── actors.ts
│   ├── date.ts
│   ├── format.ts
│   └── ...
└── entities/
    ├── ApiError.ts
    ├── EChartsTypes.ts
    └── ...
```

## Success Criteria

- [ ] All components under 150 lines
- [ ] No component has more than 2 responsibilities
- [ ] No code duplication (DRY principle)
- [ ] All custom hooks under 80 lines
- [ ] No type safety bypasses
- [ ] 80%+ code coverage for utilities
- [ ] Code review approved
- [ ] Documentation updated

## Documentation Requirements

- [ ] Update component README files
- [ ] Document new helper functions (JSDoc)
- [ ] Update AGENTS.md if needed
- [ ] Create migration guide for breaking changes

## Rollback Plan

- Each refactoring in separate PR/commit
- Can cherry-pick or revert individual changes
- Feature flags for major restructuring
- Keep old code commented for reference initially

## Dependencies

- May need testing utilities (React Testing Library)
- Need TypeScript 5.8+ features
- Consider Storybook for component documentation

## Risks

1. **Breaking Changes:** Component reorganization might break imports
2. **Merge Conflicts:** Large refactoring can create conflicts
3. **Testing Overhead:** Need comprehensive tests before refactoring

**Mitigation:**
- Refactor incrementally
- Keep PRs focused and small
- Maintain backward compatibility where possible
- Comprehensive test coverage before changes

## Timeline

- **Week 1:** Phase 1 (Tasks 1.1-1.3)
- **Week 2:** Phase 1 (Tasks 1.4-1.5) + Phase 2 (Tasks 2.1-2.2)
- **Week 3:** Phase 2 (Task 2.3) + Phase 3 + Phase 4

## Next Steps

1. Review and approve this plan
2. Create GitHub issues for each task
3. Set up testing infrastructure
4. Start with Task 4.2 (typo fix - quick win)
5. Proceed with Phase 1 (component splitting)

---

**Last Updated:** January 24, 2026
