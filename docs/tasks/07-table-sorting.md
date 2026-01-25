# Task 07 — Optimize Table Sorting & Pagination

Assigned to: `perf-agent-b`

- Files: `RepositoryTable.tsx`
- Goal: Prevent sorting on every render; consider virtual scrolling or server-side sorting for large datasets.
- Estimate: 4 hours

Steps:
1. Memoize sorted and sliced data with `useMemo`.
2. Debounce sort descriptor changes using `use-debounce` or equivalent.
3. Evaluate virtual scrolling libraries (e.g., `@tanstack/react-virtual`) for datasets > 1000 rows.
4. Add benchmarks and compare UX before/after.

Acceptance Criteria:
- [ ] Sorting is debounced and does not run unnecessarily on re-renders.
- [ ] UX is acceptable for large datasets (virtual scroll considered/implemented if necessary).
- [ ] Performance measured and documented.

Branch: `perf/table-sorting`
PR checklist: bench numbers, dependency rationale
