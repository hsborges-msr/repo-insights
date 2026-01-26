---
author: OpenCode
date: 2026-01-25
type: technical
status: proposed
code: 03-duplication-consolidation
---

# RFC 03 - Duplication consolidation (dayjs, service factory, chart configs)

Problem statement
-----------------

Common initialization and configuration patterns are duplicated across the codebase: dayjs plugin loading in multiple files, repeated `createService()` calls without a typed factory, and repeated ECharts configuration objects. This increases bundle size, cognitive load, and makes consistent changes harder.

Scope and non-goals
-------------------

- Scope: Create shared utilities for dayjs configuration, a typed service factory hook, and chart config helpers.
- Non-goals: Replace all chart libraries or change the UI layout.

Proposed approach
-----------------

1. Create `src/helpers/dayjs.ts` that exports a pre-configured dayjs instance with all required plugins loaded.
2. Implement a typed `createTypedService` wrapper or `useService` hook that centralizes token handling and namespace defaults.
3. Add `src/helpers/echarts/config.ts` with factory functions for common chart options (grid, tooltip, dataset skeleton) used by `RepositoryStatistics` and `StargazersGraph`.
4. Replace duplicated code across 7+ files to import the shared utilities.

Alternatives considered
---------------------

- Leave duplication: quick but brittle.
- Auto-generated wrappers: overkill for current scope.

Risks and tradeoffs
-------------------

- Small refactor risk: import paths and bundle might change slightly. Tests should catch regressions.
- Centralizing dayjs reduces chance to use different plugin sets in isolated components; keep export flexible.

Rollout plan
------------

1. Add helper modules and migrate imports in low-risk components.
2. Run build and tests.
3. Migrate remaining files and remove duplicated code.

Validation and testing approach
------------------------------

- Unit tests verifying dayjs instance formatting and timezone behaviour.
- Sanity checks for charts to ensure configuration parity.

Acceptance criteria
-------------------

1. No repeated `dayjs.extend(...)` calls across the codebase.
2. All `createService` usage goes through the typed factory in the repository codebase.
3. Chart components import shared config factories.

Links
-----

- Proposed ADR: `docs/ADRs/03-duplication-consolidation.md`
- Tasks: `docs/tasks/03-duplication-consolidation/`
