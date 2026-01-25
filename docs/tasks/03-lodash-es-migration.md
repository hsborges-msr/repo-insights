# Task 03 — Replace lodash with lodash‑es

Assigned to: `perf-agent-b`

- Files: `RepositoryTable.tsx`, `RepositoryHighlights.tsx`, `RepositoryStatistics.tsx`, `StargazersGraph.tsx`, `page.tsx`
- Goal: Replace full `lodash` imports with `lodash-es` per-function imports to improve tree‑shaking and reduce bundle size.
- Estimate: 2 hours

Steps:
1. Add dependency: `yarn add lodash-es` and types `yarn add -D @types/lodash-es`.
2. Replace imports (e.g. `import { orderBy } from 'lodash'` → `import orderBy from 'lodash-es/orderBy'`).
3. Remove `lodash` from `package.json` if no longer used.
4. Run bundle analyzer to verify savings.

Acceptance Criteria:
- [ ] All lodash usage migrated to `lodash-es`.
- [ ] No functional or TypeScript regressions.
- [ ] Bundle size reduced as expected (~50KB).

Branch: `perf/lodash-es-migration`
PR checklist: dependency change noted, bundle report attached
