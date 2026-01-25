# Task 05 — Audit & Replace numeral/dayjs with Intl (where appropriate)

Assigned to: `perf-agent-b`

- Files: All files importing `numeral` and `dayjs` (audit required)
- Goal: Use native `Intl` where feasible to remove small libs and reduce bundle size; keep `dayjs` for complex cases.
- Estimate: 4 hours (research + phased implementation)

Steps:
1. Audit repository for `numeral` and `dayjs` usages and list occurrences.
2. Create `src/helpers/formatters.ts` with wrapper utilities based on `Intl.NumberFormat` and `Intl.DateTimeFormat`.
3. Replace simple formatting usages with the new utilities.
4. Keep `dayjs` for complex parsing/manipulation and document rationale.
5. Measure bundle impact and rollback if issues arise.

Acceptance Criteria:
- [ ] Analysis document with all usages created.
- [ ] Utility helpers implemented and used for simple cases.
- [ ] No regressions in formatting or tests.
- [ ] Measurable bundle size improvement.

Branch: `perf/intl-formatters`
PR checklist: analysis doc, sample replacements, bundle numbers
