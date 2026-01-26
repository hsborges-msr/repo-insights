# Tasks for ADR 04 - Type safety improvements

This directory contains the implementation tasks for ADR `04-type-safety-improvements`.

Links
-----

- RFC: `../../RFCs/04-type-safety-improvements.md`
- ADR: `../ADRs/04-type-safety-improvements.md`

Goal
----

Tighten types in critical modules (hooks and cache), remove `@ts-expect-error` bypasses, and add targeted adapter types for external libraries (ECharts). Ensure CI performs `tsc --noEmit` for critical directories.

Checklist
---------

1. Create `src/types/echarts.d.ts` adapter types for the subset of ECharts used. (done)
2. Replace `@ts-expect-error` in `src/hooks/useResources.ts` with proper generics and type guards.
3. Strongly type `src/helpers/cache/browser.ts` and update Zod schemas.
4. Add linter rule(s) to fail on `@ts-expect-error` and `any` in `src/hooks` and `src/helpers`.
5. Add `tsc --noEmit` step to CI for critical directories.
6. Add unit tests for typed modules that previously used `@ts-expect-error`.

Done Criteria
-----------

- No `@ts-expect-error` remain in `src/hooks` or `src/helpers`.
- `tsc --noEmit` passes in CI for the critical directories.
- Unit tests cover edge cases for typed modules.
