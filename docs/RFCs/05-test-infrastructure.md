---
author: OpenCode
date: 2026-01-25
type: technical
status: proposed
code: 05-test-infrastructure
---

# RFC 05 - Test infrastructure and coverage plan

Problem statement
-----------------

The application code has no unit or component tests; only the `libs/core` submodule contains tests. This leaves refactors and optimizations risky and makes regressions likely.

Scope and non-goals
-------------------

- Scope: Add a test setup and initial test suites for critical hooks (`useResources`, `useAuth`), helpers (`mergeActorData`), and components (`RepositoryTable`, `StargazersGraph`). Configure Vitest and testing-library for React.
- Non-goals: Achieve 100% coverage immediately; instead, focus on high-risk modules.

Proposed approach
-----------------

1. Create a test utils folder with test renderers and mocks for the core service.
2. Add unit tests for `mergeActorData` and `cache/browser.ts` (Zod validation, TTL logic).
3. Add hook tests for `useResources` using a mocked service and fake timers.
4. Add component tests for `RepositoryTable` and `StargazersGraph` using `@testing-library/react` and snapshot checks for chart config.
5. Add coverage threshold gates to the `test:coverage` command and CI config.

Alternatives considered
---------------------

- Use Jest instead of Vitest: Vitest is already configured in the repo and is faster in ESM contexts.

Risks and tradeoffs
-------------------

- Test maintenance overhead: we keep tests focused on logic and not on visual snapshots except for chart options.

Rollout plan
------------

1. Add test utilities and mocks.
2. Implement unit tests for helpers and hooks (high priority).
3. Implement component tests.
4. Add CI coverage checks.

Validation and testing approach
------------------------------

- Local test runs and coverage reports
- CI integration to ensure coverage gates

Acceptance criteria
-------------------

1. Critical modules (hooks/helpers/components) have tests covering edge cases.
2. Coverage for newly added modules >= 80% and overall app coverage >= 60% within two sprints.

Links
-----

- Proposed ADR: `docs/ADRs/05-test-infrastructure.md`
- Tasks: `docs/tasks/05-test-infrastructure/`
