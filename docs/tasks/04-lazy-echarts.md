# Task 04 — Lazy Load ECharts

Assigned to: `perf-agent-b`

- Files: `RepositoryStatistics.tsx`, `StargazersGraph.tsx`
- Goal: Dynamically import `echarts-for-react` so charts load on demand and initial bundle shrinks.
- Estimate: 3 hours

Steps:
1. Create a lightweight `ChartSkeleton` component for fallback UI.
2. Replace static import with `const ReactECharts = lazy(() => import('echarts-for-react'))` and wrap usage in `Suspense` with the skeleton.
3. Test chart behavior (client-only loading, SSR considerations) and measure bundle impact.

Acceptance Criteria:
- [ ] Charts load only when the chart components mount.
- [ ] Skeleton is shown while loading.
- [ ] Initial bundle size reduced (~800KB impact target).

Branch: `perf/lazy-echarts`
PR checklist: skeleton component, E2E/manual test, bundle report
