---
author: OpenCode
date: 2026-01-25
type: technical
status: proposed
code: 02-data-processing-performance
---

# RFC 02 - Data processing and main-thread work reduction

Problem statement
-----------------

Large array transformations (merge operations, groupBy, countBy, sorting) are performed synchronously on the main thread in several components (`mergeActorData`, table sorting, chart data preparation). For large repositories this causes UI jank and slow interactions.

Scope and non-goals
-------------------

- Scope: Extract data transformations to reusable utilities, introduce memoization and optional off-main-thread processing (Web Worker) for the heaviest transforms. Files in scope include:
  - `src/helpers/actors.ts`
  - `src/app/r/[owner]/[name]/components/RepositoryTable.tsx`
  - `src/app/r/[owner]/[name]/components/StargazersGraph.tsx`
  - `src/app/r/[owner]/[name]/components/RepositoryStatistics.tsx`
- Non-goals: Full Web Worker migration for all components in first iteration.

Proposed approach
-----------------

1. Audit and isolate the heaviest transforms (grouping, flattening, ordering). Create pure utility functions with types and unit tests.
2. Add memoization (via `useMemo` and stable keys) and avoid recomputation when inputs are unchanged.
3. Implement an optional Web Worker helper for transformations exceeding a threshold (e.g., arrays > 5,000 items). The worker will accept serialized data, run transforms, and post results back.
4. Replace inline transforms in chart components with calls to the utilities or worker APIs.

Alternatives considered
---------------------

- Always process transforms in Web Worker: robust but increases bundle complexity and requires serialization overhead even for small datasets.
- Use incremental streaming transforms (RxJS): powerful, but adds a dependency and learning curve.

Risks and tradeoffs
-------------------

- Web Worker serialization cost: for medium-sized datasets the worker overhead might be higher than main-thread compute; we use a threshold to avoid unnecessary worker usage.
- Extra complexity in debugging transforms running in worker context; mitigate with logging and unit tests.

Rollout plan
------------

1. Extract utilities and add unit tests.
2. Add worker abstraction and test with large synthetic datasets.
3. Migrate chart components to use utilities/workers behind a feature flag.
4. Extend to table sorting if wins are observed.

Validation and testing approach
------------------------------

- Unit tests for utilities with small and large inputs.
- Performance benchmarks comparing main-thread vs worker for different dataset sizes.
- Visual regression to ensure charts and tables look identical.

Acceptance criteria
-------------------

1. Heavy transforms (>5k items) move off the main thread with net positive perf for common hardware.
2. Recomputations are minimized via memoization; repeated renders with same inputs show no re-run of heavy transforms.
3. Utilities have unit tests and clear types.

Links
-----

- Proposed ADR: `docs/ADRs/02-data-processing-performance.md`
- Tasks: `docs/tasks/02-data-processing-performance/`
