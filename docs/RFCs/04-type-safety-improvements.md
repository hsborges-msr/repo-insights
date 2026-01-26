---
author: OpenCode
date: 2026-01-25
type: technical
status: approved
code: 04-type-safety-improvements
---

# RFC 04 - Type safety improvements

Problem statement
-----------------

The codebase contains `@ts-expect-error` and `biome-ignore` comments to bypass type checks, multiple `any` usages, and limited typings around caching and ECharts. This makes refactoring risky and increases runtime errors.

Scope and non-goals
-------------------

- Scope: Tighten types in critical modules (hooks, cache, helpers), add type-safe wrappers for ECharts and the caching API, and remove type bypasses.
- Non-goals: Complete migration of all files in the repo to stricter TypeScript rules in the first pass.

Proposed approach
-----------------

1. Remove `@ts-expect-error` and replace with correct generics and type guards in `useResources` and service interactions.
2. Create `src/types/echarts.d.ts` small adapter types for the subset we use.
3. Strongly type the cache values and Zod schemas in `src/helpers/cache/browser.ts`.
4. Add linter rules to progressively fail on `any` and `@ts-expect-error` in critical directories.

Alternatives considered
---------------------

- Enforce strict mode across the entire repo immediately: too disruptive.

Risks and tradeoffs
-------------------

- Time cost for typing ECharts; we introduce adapter types instead of full coverage to reduce effort.

Rollout plan
------------

1. Type `useResources` and cache modules first.
2. Add tests for typed modules.
3. Gradually tighten linter rules.

Validation and testing approach
------------------------------

- Type-level checks via `tsc --noEmit` in CI.
- Unit tests for previously `@ts-expect-error` code paths.

Acceptance criteria
-------------------

1. No remaining `@ts-expect-error` in `src/hooks` or `src/helpers`.
2. CI type check passes with `tsc --noEmit`.

Links
-----

- Proposed ADR: `docs/ADRs/04-type-safety-improvements.md`
- Tasks: `docs/tasks/04-type-safety-improvements/`
