# Task 11 — Measurements & Bundle Analysis (Baseline)

Assigned to: `perf-agent-a`

- Files: project-wide (benchmark artifacts / scripts)
- Goal: Establish baseline metrics (bundle size, TTI, FCP, LCP, profiler render counts) and ensure each performance PR includes before/after metrics.
- Estimate: 2–3 hours setup + ongoing per task

Steps:
1. Capture baseline metrics for the main page(s): initial bundle size, TTI, FCP, LCP, and component render counts using DevTools/Lighthouse/React Profiler.
2. Add a script or npm task to run bundle analysis (e.g., `yarn analyze`).
3. Document baseline in `docs/performance-baseline.md` and require PRs to attach metric deltas.

Acceptance Criteria:
- [ ] Baseline document exists with recorded numbers.
- [ ] Each performance PR includes metric delta and a bundle report where applicable.

Branch: `perf/measurement-baseline`
PR checklist: baseline doc, analyze scripts
