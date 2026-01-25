# Task 06 — Extract Repository Data Hook

Assigned to: `perf-agent-a`

- Files: `page.tsx` → new `src/hooks/useRepositoryData.ts` and `src/helpers/actors.ts`
- Goal: Move expensive actor merging logic into a memoized custom hook and reusable helper to reduce render-time work and enable unit tests.
- Estimate: 3 hours

Steps:
1. Implement `mergeActorData` in `src/helpers/actors.ts` (use `lodash-es` helpers).
2. Implement `useRepositoryData` using `useMemo` that calls `mergeActorData`.
3. Replace inline logic in `page.tsx` with the hook.
4. Add unit tests for `mergeActorData`.

Acceptance Criteria:
- [ ] Transformation logic extracted and covered by unit tests.
- [ ] `page.tsx` simplified and reads data from the hook.
- [ ] Performance improvement validated via profiling.

Branch: `perf/use-repository-data`
PR checklist: unit tests added, profiler check, lints
