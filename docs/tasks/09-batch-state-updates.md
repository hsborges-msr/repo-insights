# Task 09 — Batch State Updates in useResources

Assigned to: `perf-agent-c`

- Files: `useResources.ts`
- Goal: Reduce cascading renders by batching multiple setState calls into a single update or using explicit batching where necessary.
- Estimate: 1 hour

Steps:
1. Replace multiple setState calls with a single updater that sets all fields together.
2. If needed, use `unstable_batchedUpdates` from `react-dom` for explicit batching (note React 18 automatic batching may suffice).
3. Verify fewer renders via Profiler.

Acceptance Criteria:
- [ ] State updates are batched and fewer re-renders observed.
- [ ] No functional regressions.

Branch: `perf/batch-state-updates`
PR checklist: profiler evidence
