# Performance Optimization Plan

**Created:** January 24, 2026  
**Priority:** High  
**Estimated Effort:** 3-5 days  
**Impact:** Significant performance improvements, better user experience

## Overview

This plan focuses on optimizing the application's runtime performance through strategic memoization, bundle size reduction, lazy loading, and efficient data processing.

## Current Performance Issues

### 1. Missing Component Memoization

**Problem:** Pure components re-render unnecessarily, causing wasted computation.

**Affected Components:**

- `Footnote.tsx` - Pure component with static content
- `Loading.tsx` - Static loading indicator
- `RepositoryError.tsx` - Static error display
- `RepositoryNotFound.tsx` - Static 404 page
- `PageSection.tsx` - Container with minimal props
- `RepositoryHighlights.tsx` - Expensive data transformations without memo

**Impact:** Unnecessary re-renders on every parent state change.

### 2. Expensive Operations in Render

**Problem:** Heavy data transformations run on every render without proper optimization.

**Locations:**

- `page.tsx:41-74` - Complex actor data merging with flatten, groupBy, orderBy
- `RepositoryTable.tsx:42-54` - Sorting and slicing large arrays
- `StargazersGraph.tsx:53-75` - Multiple data transformations with countBy/groupBy
- `RepositoryStatistics.tsx` - Three separate chart data transformations

**Impact:** UI freezes during data processing, poor responsiveness.

### 3. Large Bundle Size

**Problem:** Heavy dependencies increase initial load time.

**Current Bundle Analysis:**

- **lodash** (~70KB) - Full import instead of lodash-es
- **echarts** (~800KB) - No code splitting for charts
- **numeral** (~20KB) - Could use native Intl.NumberFormat
- **dayjs** (~30KB) with multiple plugins - Could use native Intl.DateTimeFormat

**Impact:** Slow initial page load, especially on mobile networks.

### 4. Inefficient State Updates

**Problem:** State updates trigger cascading re-renders.

**Locations:**

- `useResources.ts:83-90` - Multiple setState calls in loop
- `page.tsx:39` - Effect that immediately runs setPaused(false)
- `AuthProvider.tsx:47-59` - OAuth effect runs on every searchParams change

**Impact:** Multiple re-renders, degraded performance during data loading.

## Refactoring Tasks

### Phase 1: Component Memoization (Priority: High)

#### Task 1.1: Memoize Pure Components

**Files:** `Footnote.tsx`, `Loading.tsx`, `RepositoryError.tsx`, `RepositoryNotFound.tsx`, `PageSection.tsx`

**Action:**

```typescript
// Before
export default function Footnote() { ... }

// After
import { memo } from 'react';

const Footnote = memo(function Footnote() { ... });
export default Footnote;
```

**Acceptance Criteria:**

- [ ] All static components wrapped with React.memo()
- [ ] Verify no unnecessary re-renders in React DevTools Profiler
- [ ] No functionality changes

**Estimated Time:** 1 hour

#### Task 1.2: Memoize Data-Heavy Components

**Files:** `RepositoryHighlights.tsx`, `RepositoryStatistics.tsx`

**Action:**

```typescript
import { memo } from 'react';

const RepositoryHighlights = memo(function RepositoryHighlights({ actors }: Props) {
  // Component logic
});

export default RepositoryHighlights;
```

**Acceptance Criteria:**

- [ ] Components only re-render when actors data changes
- [ ] Performance improvement verified with React Profiler
- [ ] Props are properly memoized in parent

**Estimated Time:** 2 hours

### Phase 2: Bundle Size Optimization (Priority: High)

#### Task 2.1: Replace lodash with lodash-es

**Files:** `RepositoryTable.tsx`, `RepositoryHighlights.tsx`, `RepositoryStatistics.tsx`, `StargazersGraph.tsx`, `page.tsx`

**Action:**

```typescript
// Before
import { orderBy, countBy, groupBy } from 'lodash';

// After
import orderBy from 'lodash-es/orderBy';
import countBy from 'lodash-es/countBy';
import groupBy from 'lodash-es/groupBy';
```

**Steps:**

1. Install lodash-es: `yarn add lodash-es`
2. Install types: `yarn add -D @types/lodash-es`
3. Update all imports across 5 files
4. Update package.json to remove lodash
5. Verify tree-shaking with bundle analyzer

**Acceptance Criteria:**

- [ ] All lodash imports replaced with lodash-es
- [ ] Bundle size reduced by ~50KB (lodash removed)
- [ ] All functionality works correctly
- [ ] No TypeScript errors

**Estimated Time:** 2 hours

#### Task 2.2: Lazy Load ECharts Components

**Files:** `RepositoryStatistics.tsx`, `StargazersGraph.tsx`

**Action:**

```typescript
// Before
import ReactECharts from 'echarts-for-react';

// After
import { lazy, Suspense } from 'react';

const ReactECharts = lazy(() => import('echarts-for-react'));

// In component
<Suspense fallback={<ChartSkeleton />}>
  <ReactECharts {...props} />
</Suspense>
```

**Steps:**

1. Create `ChartSkeleton` component
2. Wrap ReactECharts usage with lazy() and Suspense
3. Verify charts load correctly
4. Measure bundle size improvement

**Acceptance Criteria:**

- [ ] Charts loaded only when component renders
- [ ] Skeleton shows during chart loading
- [ ] Initial bundle size reduced by ~800KB
- [ ] Charts render correctly after dynamic import

**Estimated Time:** 3 hours

#### Task 2.3: Consider Native APIs Over Libraries

**Files:** All files using `numeral` and `dayjs`

**Research Task:**

```typescript
// numeral alternative
// Before
numeral(123456).format('0,0')

// After (native)
new Intl.NumberFormat('en-US').format(123456)

// dayjs alternative for simple formatting
// Before
dayjs(date).format('LLL')

// After (native)
new Intl.DateTimeFormat('en-US', { 
  dateStyle: 'long', 
  timeStyle: 'long' 
}).format(date)
```

**Action:**

1. Audit all numeral usage (6 imports)
2. Audit all dayjs usage (5 imports)
3. Identify cases where Intl API can replace
4. Create utility functions for common formats
5. Gradually migrate non-complex cases

**Note:** This is optional and should be done carefully. dayjs is still useful for complex date manipulation.

**Acceptance Criteria:**

- [ ] Analysis document created
- [ ] Utility functions for Intl API created
- [ ] Simple cases migrated
- [ ] Bundle size impact measured

**Estimated Time:** 4 hours (research + implementation)

### Phase 3: Optimize Expensive Operations (Priority: High)

#### Task 3.1: Extract Data Transformation to Custom Hook

**File:** `page.tsx`

**Action:**
Create `src/hooks/useRepositoryData.ts`:

```typescript
import { useMemo } from 'react';
import { Actor, Release, Stargazer, Watcher } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import { mergeActorData } from '@/helpers/actors';

export function useRepositoryData(
  stars: Stargazer[],
  releases: Release[],
  watchers: Watcher[]
) {
  return useMemo<ActorInfo[]>(() => {
    return mergeActorData(stars, releases, watchers);
  }, [stars, releases, watchers]);
}
```

Create `src/helpers/actors.ts`:

```typescript
import { flatten, groupBy, orderBy } from 'lodash-es';
import { Actor, Reaction, Release, Stargazer, User, Watcher } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';

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
```

**Acceptance Criteria:**

- [ ] Data transformation logic extracted to reusable function
- [ ] Custom hook created for easy consumption
- [ ] page.tsx simplified
- [ ] Logic covered by unit tests
- [ ] Performance impact measured

**Estimated Time:** 3 hours

#### Task 3.2: Optimize Table Sorting and Pagination

**File:** `RepositoryTable.tsx`

**Action:**
Currently sorting happens on every render. Consider:

1. Virtual scrolling for large datasets
2. Server-side sorting if data comes from API
3. Debounce sort operations

```typescript
import { useMemo, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

// Debounce sort changes
const handleSortChange = useDebouncedCallback(
  ({ column, direction }) => {
    setDescriptor([...]);
  },
  100
);
```

**Acceptance Criteria:**

- [ ] Sorting debounced for better UX
- [ ] Consider virtual scrolling for 1000+ items
- [ ] Performance measured before/after

**Estimated Time:** 4 hours

#### Task 3.3: Optimize StargazersGraph Data Processing

**File:** `StargazersGraph.tsx`

**Action:**
Extract data processing to custom hook:

```typescript
// Create src/hooks/useStargazersSeries.ts
export function useStargazersSeries(
  stargazers: Stargazer[],
  type: 'absolute' | 'cumulative',
  granularity: 'day' | 'week' | 'month' | 'year'
) {
  return useMemo(() => {
    // Move complex logic here
    // Return processed series data
  }, [stargazers, type, granularity]);
}
```

**Acceptance Criteria:**

- [ ] Data processing logic extracted
- [ ] Component simplified
- [ ] Logic reusable and testable
- [ ] Performance improvement verified

**Estimated Time:** 2 hours

### Phase 4: State Update Optimization (Priority: Medium)

#### Task 4.1: Batch State Updates in useResources

**File:** `useResources.ts`

**Action:**

```typescript
// Before - Multiple setState calls
setData((pv) => ({ ...pv, records: [...cache] }));

// After - Single batched update
import { unstable_batchedUpdates } from 'react-dom';

unstable_batchedUpdates(() => {
  setData((pv) => ({
    ...pv,
    records: [...cache],
    cursor: element.metadata.cursor || pv.cursor,
    hasMore: element.metadata.has_more,
    cached: !!__cached
  }));
});
```

**Note:** In React 18+, automatic batching handles this, but explicit batching ensures optimization.

**Acceptance Criteria:**

- [ ] State updates batched properly
- [ ] Verify fewer re-renders
- [ ] No functionality changes

**Estimated Time:** 1 hour

#### Task 4.2: Optimize OAuth Effect Dependencies

**File:** `AuthProvider.tsx`

**Action:**

```typescript
// Add dependency check to avoid unnecessary runs
useEffect(() => {
  if (!code) return; // Early return if no code
  
  const controller = new AbortController();
  // ... rest of logic
}, [code]); // Only depend on code, not all searchParams
```

**Acceptance Criteria:**

- [ ] Effect only runs when necessary
- [ ] No infinite loops
- [ ] OAuth flow still works correctly

**Estimated Time:** 1 hour

## Performance Measurement

### Before Optimization Metrics

- [ ] Initial bundle size: ___ KB
- [ ] Time to Interactive (TTI): ___ ms
- [ ] First Contentful Paint (FCP): ___ ms
- [ ] Largest Contentful Paint (LCP): ___ ms
- [ ] Component render count (React Profiler)

### After Optimization Targets

- [ ] Bundle size reduction: 30-40% (target: -900KB)
- [ ] TTI improvement: 20-30%
- [ ] FCP improvement: 10-15%
- [ ] Reduced re-renders: 40-60%

### Tools to Use

- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse
- webpack-bundle-analyzer (or Next.js analyzer)
- Web Vitals library

## Testing Strategy

1. **Performance Testing**
   - Measure before/after metrics
   - Test with large datasets (10,000+ actors)
   - Test on slow 3G network
   - Test on low-end devices

2. **Functional Testing**
   - All features work correctly
   - No visual regressions
   - Data accuracy maintained
   - User interactions responsive

3. **Bundle Analysis**
   - Run bundle analyzer before/after
   - Verify tree-shaking works
   - Check for duplicate dependencies

## Rollback Plan

If performance optimizations cause issues:

1. Each task in separate commit
2. Can revert individual changes
3. Feature flags for major changes
4. Gradual rollout to users

## Success Criteria

- [ ] All Phase 1 tasks completed
- [ ] All Phase 2 tasks completed
- [ ] Phase 3 tasks completed or in progress
- [ ] Bundle size reduced by at least 30%
- [ ] Performance metrics improved by target percentages
- [ ] No regressions in functionality
- [ ] Code review approved
- [ ] QA testing passed

## Dependencies

- Requires lodash-es package
- May need bundle analyzer plugin
- Need performance testing infrastructure

## Risks

1. **Breaking Changes:** Lazy loading might affect SSR
2. **Complexity:** Memoization can add complexity
3. **Over-optimization:** Premature optimization in wrong places

**Mitigation:**

- Careful testing with each change
- Measure before optimizing
- Keep changes incremental and reviewable

## Next Steps

1. Review and approve this plan
2. Set up performance measurement baseline
3. Create tasks in project management tool
4. Start with Phase 1 (quick wins)
5. Proceed to Phase 2 (high impact)

---

**Last Updated:** January 24, 2026
