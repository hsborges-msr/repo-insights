# Task 01 — Memoize Pure Components

Assigned to: `perf-agent-a`

- Files: `Footnote.tsx`, `Loading.tsx`, `RepositoryError.tsx`, `RepositoryNotFound.tsx`, `PageSection.tsx`
- Goal: Wrap static/pure components with `React.memo` to avoid unnecessary re-renders.
- Estimate: 1 hour

Steps:
1. Update each component export to use `memo` from React.
2. Run `yarn lint:fix` and `yarn format`.
3. Verify with React DevTools Profiler that render counts are reduced.

Acceptance Criteria:
- [ ] All listed components use `React.memo`.
- [ ] No behavioral regressions.
- [ ] Profiler shows eliminated unnecessary re-renders.

Branch: `perf/memoize-pure-components`
PR checklist: unit smoke, profiler screenshot, CI green
