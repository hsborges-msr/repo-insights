---
author: OpenCode
date: 2026-01-25
type: technical
status: proposed
code: 01-hook-performance-optimization
---

# RFC 01 - Hook performance optimization

Problem statement
-----------------

The `useResources` hook (and related resource-fetching hooks) perform uncontrolled async iteration, lack request throttling, and accumulate large in-memory arrays for repositories with large datasets. This causes main-thread blocking, frequent re-renders, and high memory usage for popular repositories.

Scope and non-goals
-------------------

- Scope: Improve performance and maintainability of resource fetching by refactoring `useResources` into smaller, testable parts, adding backpressure/throttling, and limiting in-memory accumulation. Files in scope include:
  - `src/hooks/useResources.ts`
  - `src/hooks/useRepository.ts` (minor changes as needed)
  - Cache interaction in `src/helpers/cache/browser.ts` (read path improvements)
- Non-goals: Rewriting or modifying the `libs/core` submodule; introducing server-side rendering changes to data contracts.

Proposed approach
-----------------

1. Split `useResources` into two hooks:
   - `useResourceFetch` responsible for controlled paginated fetching from the service with concurrency limits and retries (returns an async iterator or generator of batches).
   - `useResourceCache` responsible for reading/writing compressed cache and producing a stable view for consumers. This will expose a streaming API (append-only) and a truncated, windowed in-memory representation for UI consumption.
2. Add configurable backpressure: limit concurrent requests and throttle batch handling to avoid UI jank. Use `p-limit` and an internal queue that yields at most N items in memory (configurable via constants).
3. Reduce re-renders by batching state updates (apply setState once per batch) and offering an incremental subscription interface for large datasets.
4. Add TypeScript generics and remove `@ts-expect-error` usages by tightening the resource types returned by the core client.

Alternatives considered
---------------------

- Move fetching to a Web Worker: great for off‑main‑thread processing but increases complexity for state management and serialization. Considered as a follow-up for the heaviest transformations.
- Server-side pagination and summary endpoints: requires backend changes and core library modifications (out of scope).

Risks and tradeoffs
-------------------

- Introducing a windowed cache reduces memory at the cost of possibly hiding older items from the UI; acceptance criteria will require a configuration option and documentation.
- Splitting hooks increases indirection which may confuse new contributors; mitigate with clear docs and types.
- Slight behavioral change: consumers that relied on the full in-memory array may need small adaptations (expose `getAll()` for test/dev mode).

Rollout plan
------------

1. Create new `useResourceFetch` and `useResourceCache` hooks behind a feature-flag or new exported API.
2. Replace internal consumers (repository page and table) to use the new hooks incrementally.
3. Monitor performance on local large-repo fixtures and run benchmarks.
4. Remove legacy `useResources` after both internal consumers are migrated and tests pass.

Validation and testing approach
------------------------------

- Unit tests for `useResourceFetch` to verify paging, retries, and concurrency limits (mock core service).
- Unit tests for `useResourceCache` to verify compression/decompression and TTL handling.
- Integration tests for the repository page using a large fixture to assert render time and memory usage improvements.

Acceptance criteria
-------------------

1. The repository page can render a repository with 10k stargazers without blocking the main thread for more than 100ms during initial load on a modern dev machine.
2. Memory footprint for in-memory resource representation is reduced by configurable windowing; default retains at most 2,500 items.
3. No `@ts-expect-error` remain in `useResources` or the new hooks.
4. Tests cover paging and cache behavior with >= 90% branch coverage for the new modules.

Links
-----

- Proposed ADR: `docs/ADRs/01-hook-performance-optimization.md`
- Tasks: `docs/tasks/01-hook-performance-optimization/`
