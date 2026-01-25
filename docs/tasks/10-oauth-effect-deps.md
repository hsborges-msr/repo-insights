# Task 10 — Optimize OAuth Effect Dependencies

Assigned to: `perf-agent-c`

- Files: `AuthProvider.tsx`
- Goal: Prevent unnecessary OAuth effect runs by tightening effect dependencies and adding early returns/abort handling.
- Estimate: 1 hour

Steps:
1. Change the effect to depend only on `code` (or the minimal values required).
2. Add an early return when `code` is falsy.
3. Use `AbortController` to cancel in-flight requests on cleanup.
4. Test the OAuth flow end-to-end to ensure correctness.

Acceptance Criteria:
- [ ] Effect only runs when `code` changes.
- [ ] No infinite loops and OAuth still works.

Branch: `perf/oauth-effect-deps`
PR checklist: manual auth test, small unit tests
