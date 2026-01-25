# Task 02 — Memoize Data‑Heavy Components

Assigned to: `perf-agent-a`

- Files: `RepositoryHighlights.tsx`, `RepositoryStatistics.tsx`
- Goal: Use `React.memo` and ensure parent props are stable so heavy components re-render only when data changes.
- Estimate: 2 hours

Steps:
1. Wrap components with `memo` from React.
2. Audit parent components and memoize props using `useMemo`/`useCallback` as needed.
3. Run lint/format and test with Profiler.

Acceptance Criteria:
- [ ] Components re-render only when their data props change.
- [ ] No TypeScript or runtime errors.
- [ ] Performance improvement verified with React Profiler.

Branch: `perf/memoize-data-components`
PR checklist: profiler before/after, tests
