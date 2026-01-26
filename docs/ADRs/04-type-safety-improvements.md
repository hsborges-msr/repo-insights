---
code: 04-type-safety-improvements
title: Type safety improvements
author: OpenCode
date: 2026-01-25
status: approved
---

# ADR 04 - Type safety improvements

Context
-------

The repository currently uses `@ts-expect-error` and `biome-ignore` suppression comments in several critical modules (notably `useResources` and the browser cache). There are also permissive `any` usages and limited typings for external libraries (ECharts). These make refactors risky and allow runtime type errors to escape compilation checks.

Decision
--------

We will execute a staged type-safety improvement plan (RFC 04) focused on critical modules first. The decision includes the following actions:

1. Remove `@ts-expect-error` usages in `src/hooks` and `src/helpers` by replacing them with correct TypeScript generics, type guards, or adapter types.
2. Add a small adapter declaration file `src/types/echarts.d.ts` describing the subset of ECharts types the app consumes.
3. Strongly type the cache values and Zod validation schemas in `src/helpers/cache/browser.ts` so serialization/decompression returns typed values.
4. Add progressive linter rules for `any` and `@ts-expect-error` in critical directories, enforced in CI on a staged basis.
5. Add type-level CI checks (`tsc --noEmit`) to fail when critical directories regress.

Consequences
------------

- Positive:
  - Increased confidence when refactoring; fewer runtime type errors.
  - Improved IDE/autocomplete for contributors.
  - Cleaner, maintainable code in core modules.

- Negative / tradeoffs:
  - Upfront engineering time to write types and adjust existing code paths.
  - Potential minor refactors required across multiple files to satisfy stricter types.

Links
-----

- RFC: `docs/RFCs/04-type-safety-improvements.md`
- Tasks: `docs/tasks/04-type-safety-improvements/`
