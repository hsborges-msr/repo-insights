# Task 08 — Extract Stargazers Series Hook

Assigned to: `perf-agent-c`

- Files: `StargazersGraph.tsx` → new `src/hooks/useStargazersSeries.ts`
- Goal: Move heavy stargazers aggregation to a memoized hook to reduce per-render cost and enable testing.
- Estimate: 2 hours

Steps:
1. Implement `useStargazersSeries` using `useMemo` and accept parameters (`stargazers`, `type`, `granularity`).
2. Replace inline logic in `StargazersGraph.tsx` with the hook.
3. Add unit tests for the series logic.

Acceptance Criteria:
- [ ] Data processing logic extracted and testable.
- [ ] Graph component simplified and faster to render.
- [ ] Performance validated with profiler.

Branch: `perf/use-stargazers-series`
PR checklist: unit tests, profiler
