---
description: Standards for documenting plan execution results and learnings
globs: docs/reports/*.md
---

# Plans Execution — Documenting Results & Learning

## Purpose

- Provide a concise, repeatable template to document the outcomes and learning from plan executions.
- Make results discoverable, comparable, and actionable for future planning cycles.

## When to use

- After completing a planned set of tasks, sprint, experiment, or focused initiative.
- Any time a plan produced measurable outcomes, significant blockers, or learning.

## Required fields (template)

- **Title**: Short, descriptive name for the plan execution.
- **Date**: Execution completion date (YYYY-MM-DD).
- **Author(s)**: Names and roles of people who prepared the report.
- **Objectives**: Original goals or success criteria the plan intended to meet.
- **Scope**: What was included and explicitly excluded in this execution.
- **Activities & Timeline**: Key actions taken and their timeline (one-line per step).
- **Outcomes**: Concrete results (metrics, delivered artifacts, decisions).
- **Evidence**: Links to commits, PRs, tickets, dashboards, screenshots, logs.
- **Metrics & Evaluation**: Measured values vs. targets and method of measurement.
- **Blockers & Root Causes**: Problems encountered and their causes.
- **Mitigations & Workarounds**: What was done to mitigate issues during execution.
- **Lessons Learned**: Concise statements of what worked, what didn’t, and why.
- **Action Items & Owners**: Follow-up tasks with owners and due dates.
- **Risk & Follow-up**: Remaining risks and recommended re-evaluation dates.
- **Version / Tags**: Short tags for search (e.g., `experiment`, `release`, `infra`, `perf`).

## Storage and naming

- Directory: `docs/reports/`
- Filename: `YYYY-MM-DD--short-title.md`
- Tags: Add tags in the `Version / Tags` line for searchability

## Template

```markdown
**Title:** 

**Date:** 

**Author(s):** 

**Objectives:**
- 

**Scope:**
- Included: 
- Excluded: 

**Activities & Timeline:**
- YYYY-MM-DD — Activity summary

**Outcomes:**
- Delivered: (artifacts, PR links)
- Measured impact: (metric name — before → after)

**Evidence:**
- Commits: <repo link>
- PRs: <pr link>
- Tickets: <ticket link>
- Dashboards: <dashboard link>

**Metrics & Evaluation:**
- Metric A: target X, result Y, measurement method Z

**Blockers & Root Causes:**
- Blocker A — root cause

**Mitigations & Workarounds:**
- What we did and why

**Lessons Learned:**
- 1 sentence per lesson

**Action Items & Owners:**
- [ ] Action — Owner — due YYYY-MM-DD

**Risk & Follow-up:**
- Risk A — recommended review date

**Version / Tags:**
- tags: `experiment`, `release` 
```

## Checklist before publishing

- [ ] Objectives clearly stated
- [ ] Evidence links attached (PRs, commits, dashboards)
- [ ] Action items have owners & due dates
- [ ] Tags added for discoverability
- [ ] Reviewed by at least one peer
