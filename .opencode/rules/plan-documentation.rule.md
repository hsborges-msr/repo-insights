---
description: Standards for documenting plans and workflows required
---

# Plan documentation rules

These rules define the **mandatory workflow** an agent must follow when a user asks for a plan.

## Mandatory flow (no exceptions)

1. **Plan**

   - When the user requests a plan, the agent MUST produce a clear plan (steps, scope, assumptions).
   - The plan MUST identify one or more **changes** (each change is a distinct deliverable that could be implemented independently).

2. **RFCs (one per change)**

   - After the plan is created, the agent MUST create **one RFC per change** in `docs/RFCs/`.
   - If `docs/RFCs/` does not exist, the agent MUST create it.
   - Each RFC MUST have a **code** used to link all artifacts together.
   - If user approve, or reject, a RFC, the agent MUST update its status.

3. **ADRs (one per RFC)**

   - If a RFC is approved (only if), the agent MUST generate a corresponding ADR in `docs/ADRs/`.
   - If `docs/ADRs/` does not exist, the agent MUST create it.
   - The ADR MUST use the **same code** as its RFC.

4. **Tasks (one set per ADR)**

   - For every ADR generated, the agent MUST document the implementation tasks in `docs/tasks/<adr_code>/`.
   - If `docs/tasks/<adr_code>/` does not exist, the agent MUST create it.

5. **Implementation gate**

   - The agent MUST NOT write a ADR if the corresponding RFC is not approved
   - The agent MUST NOT start implementation (code changes) until:
     - All RFCs are written.
     - All ADRs are written.
     - All task definitions exist in `docs/tasks/<adr_code>/`.

6. **Learnings and memorization**

   - For every task executed, the agent MUST write a report containing a summary of the changes

## Naming and code conventions

- `code` / `adr_code` format: `NN-kebab-slug` (example: `12-cache-github-responses`).
- RFC file path: `docs/RFCs/<code>.md`
- ADR file path: `docs/ADRs/<code>.md`
- Tasks directory: `docs/tasks/<code>/`

If multiple changes are created from one plan, the agent MUST allocate a unique `NN-...` code per change.

## Minimum required content

### RFC (`docs/RFCs/<code>.md`)

RFCs MUST include, at minimum:

- Metadata: author, date, type, status (proposed, approved, rejected)
- Problem statement
- Scope and non-goals
- Proposed approach
- Alternatives considered
- Risks/tradeoffs
- Rollout plan
- Validation/testing approach
- Acceptance criteria

### ADR (`docs/ADRs/<code>.md`)

ADRs MUST include, at minimum:

- Context
- Decision
- Consequences
- Links: MUST reference its RFC (`docs/RFCs/<code>.md`)

### Tasks (`docs/tasks/<code>/`)

Tasks MUST include, at minimum:

- A `README.md` summarizing the goal, referencing the ADR and RFC
- A checklist of concrete tasks needed to implement the ADR
- Clear “done” criteria (what to verify / how to test)
- **After impleentation:** A `REPORT.md` summarizing the activities performed and learnings obtained

## Linking rules

- Every RFC MUST link to its ADR and tasks directory.
- Every ADR MUST link back to its RFC and to its tasks directory.
- The tasks `README.md` MUST link to the ADR and RFC.

## Enforcement

- If the user asks to “just implement”, the agent MUST first ensure the RFC/ADR/tasks artifacts exist for the relevant change.
- If the user requests a plan update that introduces a new change, the agent MUST create the new RFC/ADR/tasks set before implementing that new change.
