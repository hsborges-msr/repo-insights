# Quick Wins Refactoring Plan

**Created:** January 24, 2026  
**Priority:** High  
**Estimated Effort:** 1-2 days  
**Impact:** Immediate improvements with minimal risk

## Overview

This plan focuses on low-risk, high-impact changes that can be implemented quickly to deliver immediate value. These "quick wins" will improve code quality, performance, and maintainability without requiring extensive refactoring or testing.

## Quick Win Categories

### 🚀 Immediate Impact (< 2 hours each)

### 🔧 Low Risk Changes

### ✅ Easy to Implement

### 📈 Measurable Improvements

---

## Quick Win #1: Fix Auth Token Typo

**Priority:** ⚠️ Critical  
**Effort:** 30 minutes  
**Impact:** Fixes naming consistency, prevents confusion

### Problem

Auth token stored as `__acess_token` (typo: should be `__access_token`)

### Solution

**Files to Update:**

1. `src/providers/AuthProvider.tsx:11,34,67`
2. `src/hooks/useResources.ts:67`

**Changes:**

```typescript
// Before
__acess_token

// After
__access_token
```

### Steps

1. Find all occurrences: `rg "__acess_token"`
2. Replace in type definitions
3. Replace in usage locations
4. Clear localStorage (migration note)
5. Test OAuth flow

### Testing

- [ ] Sign in with GitHub works
- [ ] Token stored correctly
- [ ] API requests authenticated
- [ ] Users can re-authenticate

### Migration Note

Add to CHANGELOG.md:

```markdown
## [Next Version]

### Breaking Changes
- Fixed typo in auth token storage key (`__acess_token` → `__access_token`)
- Users will need to sign in again after this update
```

**Acceptance Criteria:**

- [ ] Typo fixed in all locations
- [ ] OAuth flow tested
- [ ] Migration note added
- [ ] No TypeScript errors

---

## Quick Win #2: Fix Linting Violations

**Priority:** High  
**Effort:** 30 minutes  
**Impact:** Clean lint output, better React performance

### Problem

3 instances of using array index as React key

### Solution

**Location 1:** `src/app/components/CacheManager.tsx:73`

```typescript
// Before
databases.value?.map((db, index) => (
  <li key={index}>

// After
databases.value?.map((db) => (
  <li key={db.name}>
```

**Location 2:** `src/app/r/[owner]/[name]/components/RepositoryTable.tsx:160`

```typescript
// Before
{items.map((item, index) => {
  const user = item as User;
  return (
    <TableRow key={index}>

// After
{items.map((item) => {
  const user = item as User;
  return (
    <TableRow key={user.id}>
```

**Location 3:** `src/app/r/[owner]/[name]/components/RepositoryTable.tsx:174`

```typescript
// Before
.map((s, index) => (
  <div key={index} className="text-xs">

// After
.map(([event, count]) => (
  <div key={event} className="text-xs">
    {event}: {count}
  </div>
))
```

### Testing

- [ ] No visual changes
- [ ] Table still renders correctly
- [ ] Cache manager shows databases
- [ ] `yarn lint` passes with 0 warnings

**Acceptance Criteria:**

- [ ] All 3 violations fixed
- [ ] Stable keys used
- [ ] No linting warnings
- [ ] Tests pass (if exist)

---

## Quick Win #3: Add React.memo to Pure Components

**Priority:** High  
**Effort:** 1 hour  
**Impact:** Reduces unnecessary re-renders by 40-60%

### Problem

Pure components re-render on every parent state change

### Solution

**Components to Memoize:**

1. `Footnote.tsx` - Static footer
2. `Loading.tsx` - Loading spinner
3. `RepositoryError.tsx` - Error display
4. `RepositoryNotFound.tsx` - 404 page
5. `PageSection.tsx` - Simple wrapper

**Pattern:**

```typescript
// Before
export default function ComponentName() {
  return <div>Content</div>;
}

// After
import { memo } from 'react';

const ComponentName = memo(function ComponentName() {
  return <div>Content</div>;
});

export default ComponentName;
```

### Testing

- [ ] Verify with React DevTools Profiler
- [ ] Components only render when props change
- [ ] No visual changes
- [ ] All functionality preserved

**Acceptance Criteria:**

- [ ] All 5 components memoized
- [ ] Profiler shows reduced renders
- [ ] No side effects
- [ ] Export name preserved

**Expected Impact:**

- 40-60% reduction in unnecessary renders for these components
- Smoother UI interactions
- Better performance on data updates

---

## Quick Win #4: Replace lodash with lodash-es

**Priority:** High  
**Effort:** 1.5 hours  
**Impact:** ~50KB bundle size reduction

### Problem

Full lodash imported instead of tree-shakeable lodash-es

### Solution

**Files Affected:** 5 files using lodash

- `RepositoryTable.tsx`
- `RepositoryHighlights.tsx`
- `RepositoryStatistics.tsx`
- `StargazersGraph.tsx`
- `page.tsx`

**Steps:**

1. Install lodash-es

```bash
yarn add lodash-es
yarn add -D @types/lodash-es
```

1. Update imports

```typescript
// Before
import { orderBy, countBy, groupBy, flatten } from 'lodash';

// After
import orderBy from 'lodash-es/orderBy';
import countBy from 'lodash-es/countBy';
import groupBy from 'lodash-es/groupBy';
import flatten from 'lodash-es/flatten';
```

1. Remove lodash

```bash
yarn remove lodash @types/lodash
```

1. Verify tree-shaking

```bash
yarn build
# Check bundle size in .next/static/
```

### Testing

- [ ] All functionality works
- [ ] No TypeScript errors
- [ ] Bundle size reduced
- [ ] Build succeeds

**Acceptance Criteria:**

- [ ] lodash-es installed
- [ ] All imports updated (5 files)
- [ ] lodash removed
- [ ] Bundle size reduced ~50KB
- [ ] No runtime errors

**Expected Impact:**

- Initial bundle: -50KB
- Better tree-shaking
- Faster load times

---

## Quick Win #5: Add Missing JSDoc Comments

**Priority:** Medium  
**Effort:** 1 hour  
**Impact:** Better developer experience, clearer intent

### Problem

Many components have empty JSDoc comments (`/** */`)

### Solution

**Pattern:**

```typescript
// Before
/**
 *
 */
export default function RepositoryTable({ actors }: Props) {

// After
/**
 * Displays repository actors in a sortable, paginated table
 * 
 * Features:
 * - Sortable columns (user, events, followers, etc.)
 * - Pagination with configurable page size
 * - Download actors data as JSON
 * - Toggle detailed view for hireable/star/expert status
 * 
 * @param actors - Array of actor information including events
 */
export default function RepositoryTable({ actors }: Props) {
```

**Components to Document:**

1. `RepositoryTable.tsx`
2. `RepositoryStatistics.tsx`
3. `RepositoryHighlights.tsx`
4. `StargazersGraph.tsx`
5. `RepositoryHeader.tsx`
6. `Header.tsx`
7. Custom hooks in `src/hooks/`

### Guidelines

- One-line summary
- Key features (bullet points)
- Parameter descriptions
- Return value if applicable

**Acceptance Criteria:**

- [ ] All major components documented
- [ ] Hooks documented
- [ ] Parameters described
- [ ] Clear, concise descriptions

---

## Quick Win #6: Add .gitignore for docs/plans

**Priority:** Low  
**Effort:** 5 minutes  
**Impact:** Clean git status

### Solution

If plans are work-in-progress and shouldn't be committed yet:

```bash
echo "# Work in progress plans" >> .gitignore
echo "/docs/plans/*.draft.md" >> .gitignore
```

Or create docs/.gitignore:

```
# Temporary plan files
*.draft.md
*.wip.md
```

**Acceptance Criteria:**

- [ ] Appropriate files ignored
- [ ] Final plans still tracked
- [ ] Clean git status

---

## Quick Win #7: Add package.json Scripts

**Priority:** Medium  
**Effort:** 10 minutes  
**Impact:** Better developer workflow

### Solution

Add useful scripts to `package.json`:

```json
{
  "scripts": {
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "lint:check": "biome check ./src",
    "format:check": "biome format ./src",
    "type-check": "tsc --noEmit",
    "analyze": "cross-env ANALYZE=true next build",
    "clean": "rm -rf .next node_modules/.cache dist"
  }
}
```

Install if needed:

```bash
yarn add -D cross-env @next/bundle-analyzer
```

Configure bundle analyzer in `next.config.js`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

**Acceptance Criteria:**

- [ ] New scripts added
- [ ] Scripts work correctly
- [ ] Dependencies installed if needed
- [ ] Documentation updated

---

## Quick Win #8: Improve Error Messages

**Priority:** Medium  
**Effort:** 30 minutes  
**Impact:** Better debugging

### Problem

Generic error messages don't help debug issues

### Solution

**Update RepositoryError.tsx:**

```typescript
// Before
export default function RepositoryError({ error }: { error: any }) {
  return <div>Error loading repository</div>;
}

// After
import { isApiError } from '@/entities/errors';

export default function RepositoryError({ error }: { error: Error | ApiError }) {
  const message = isApiError(error)
    ? `Failed to load repository: ${error.message} (Status: ${error.statusCode})`
    : `An unexpected error occurred: ${error.message}`;

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-bold">Unable to Load Repository</h2>
      <p className="text-gray-600">{message}</p>
      {process.env.NODE_ENV === 'development' && (
        <details className="w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-gray-500">
            Technical Details
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] Meaningful error messages
- [ ] Error details in development
- [ ] User-friendly in production
- [ ] Proper typing

---

## Quick Win #9: Add Loading States to Buttons

**Priority:** Low  
**Effort:** 30 minutes  
**Impact:** Better UX

### Problem

Buttons don't show loading state during async operations

### Solution

**Example in SignInButton:**

```typescript
// Before
<Button onPress={handleSignIn}>
  Sign In with GitHub
</Button>

// After
const [isLoading, setLoading] = useState(false);

<Button 
  onPress={async () => {
    setLoading(true);
    try {
      await handleSignIn();
    } finally {
      setLoading(false);
    }
  }}
  isLoading={isLoading}
  spinner={<Spinner size="sm" />}
>
  {isLoading ? 'Signing in...' : 'Sign In with GitHub'}
</Button>
```

**Acceptance Criteria:**

- [ ] Loading states on async buttons
- [ ] Spinners show during operations
- [ ] Buttons disabled while loading
- [ ] Better user feedback

---

## Quick Win #10: Add Constants File

**Priority:** Low  
**Effort:** 15 minutes  
**Impact:** Centralized configuration

### Solution

Create `src/constants/index.ts`:

```typescript
/**
 * Application-wide constants
 */

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  REPOSITORY: 24 * 60 * 60 * 1000, // 1 day
  USER: 7 * 24 * 60 * 60 * 1000,   // 7 days
  STARGAZERS: 7 * 24 * 60 * 60 * 1000 // 7 days
} as const;

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CONCURRENT_LIMIT: 2
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Date Formats
export const DATE_FORMATS = {
  LONG: 'LLL',
  SHORT: 'L',
  RELATIVE: 'fromNow'
} as const;

// GitHub OAuth
export const GITHUB_CONFIG = {
  OAUTH_URL: 'https://github.com/login/oauth/authorize',
  SCOPE: 'read:user'
} as const;
```

**Usage:**

```typescript
import { PAGINATION, CACHE_TTL } from '@/constants';

const [perPage, setPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
```

**Acceptance Criteria:**

- [ ] Constants file created
- [ ] Magic numbers replaced
- [ ] Type-safe constants
- [ ] Used in relevant files

---

## Implementation Order (Recommended)

### Day 1 - Morning (2-3 hours)

1. ✅ Fix auth token typo (30 min) - **CRITICAL**
2. ✅ Fix linting violations (30 min)
3. ✅ Add React.memo to pure components (1 hour)
4. ✅ Add missing JSDoc comments (1 hour)

### Day 1 - Afternoon (2-3 hours)

5. ✅ Replace lodash with lodash-es (1.5 hours)
2. ✅ Add constants file (15 min)
3. ✅ Add package.json scripts (10 min)
4. ✅ Add .gitignore updates (5 min)

### Day 2 - If time permits (2-3 hours)

9. ✅ Improve error messages (30 min)
2. ✅ Add loading states to buttons (30 min)
3. 📝 Document completed changes
4. 🧪 Test all changes

---

## Success Metrics

### Before Quick Wins

- Lint warnings: 3
- Bundle size: ~X KB
- Auth token: misspelled
- Pure components: 0 memoized
- Documentation: Minimal

### After Quick Wins (Target)

- Lint warnings: 0 ✅
- Bundle size: ~(X-50) KB ✅
- Auth token: Fixed ✅
- Pure components: 5 memoized ✅
- Documentation: Improved ✅
- Developer experience: Better ✅

---

## Testing Checklist

After implementing quick wins:

- [ ] `yarn lint` passes with 0 warnings
- [ ] `yarn build` succeeds
- [ ] `yarn test` passes (if tests exist)
- [ ] Bundle size reduced (check .next/static/)
- [ ] OAuth flow works
- [ ] No visual regressions
- [ ] React Profiler shows fewer renders
- [ ] All functionality preserved

---

## Rollback Plan

Each quick win is independent:

- Separate git commit for each change
- Can revert individual commits
- No interdependencies
- Low risk changes

If something breaks:

```bash
git log --oneline -10
git revert <commit-hash>
```

---

## Next Steps After Quick Wins

Once quick wins are complete:

1. Commit changes with descriptive messages
2. Create PR for review
3. Measure impact (bundle size, performance)
4. Proceed with larger refactoring plans
5. Document lessons learned

---

## Additional Quick Win Ideas (Future)

- Add `loading="lazy"` to images
- Add `rel="noopener noreferrer"` to external links
- Extract magic numbers to constants
- Add meta tags for SEO
- Add Open Graph tags
- Configure CSP headers
- Add rate limiting to API routes
- Add request logging
- Compress static assets
- Enable Next.js image optimization

---

**Last Updated:** January 24, 2026
