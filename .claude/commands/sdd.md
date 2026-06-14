---
description: Start a new Spec-Driven Development feature (scaffold + STATUS.md + analyst)
argument-hint: <feature-name> [short description]
allowed-tools: Task, Read, Write, Edit, Bash, Grep, Glob
---

Start a new backend SDD feature. Raw input: `$ARGUMENTS`
(first token = `kebab-case` feature name; the rest = optional free-text description).

This project is **backend-only** for SDD — never scaffold or touch `frontend/`.

## Steps

1. **Parse** the feature name (first token). If it is missing or not
   `kebab-case`, stop and ask the user for a valid name.

2. **Scaffold** the workspace (only the dirs that don't already exist):
   - `specs/<name>/backend/`
   - `specs/<name>/contract/examples/requests/`
   - `specs/<name>/contract/examples/responses/`
   Do **not** create any `tests/` dir under `specs/` — Go tests live in
   `backend/` (see `specs/README.md`).

3. **Create `specs/<name>/STATUS.md`** if it does not exist, from the template
   below. Get today's date with `date +%Y-%m-%d`. This file is the shared memory
   between the (isolated) subagents — every agent reads it for upstream
   decisions, and you keep it updated after every phase.

4. **Phase 1 — Spec.** Mark phase 1 `🔄 in-progress` in STATUS.md, then invoke
   the `analyst` subagent (Task tool) to produce
   `specs/<name>/backend/behavior.feature`. Pass it: the feature name, the
   description, and an instruction to read `specs/<name>/STATUS.md` first.
   The analyst asks clarifying questions — relay them to the user and wait.

5. When the Gherkin is saved: mark phase 1 `✅ done`, record any assumptions in
   the Decision log and unresolved items in Open questions, then tell the user
   to run `/sdd-next` (step-by-step) or `/sdd-auto` (run the rest).

## STATUS.md template

```markdown
# SDD Status — <name>

- **Feature:** <name>
- **Created:** <YYYY-MM-DD>
- **Mode:** step
- **Current phase:** 1 — Spec

## Phases
| # | Phase | Agent | Status | Artifact |
|---|-------|-------|--------|----------|
| 1 | Spec | analyst | 🔄 in-progress | `specs/<name>/backend/behavior.feature` |
| 2 | Contract | contract-dev | ⬜ pending | `specs/<name>/contract/openapi.yaml` |
| 3 | Tests (RED) | qa-engineer | ⬜ pending | `backend/test/acceptance/` + `backend/internal/**/*_test.go` |
| 4 | Implementation | developer | ⬜ pending | `backend/internal/...` |
| 5 | Test run | qa-engineer | ⬜ pending | `make -C backend verify` |
| 6 | Review | reviewer | ⬜ pending | review report |

Status legend: ⬜ pending · 🔄 in-progress · ✅ done · ❌ failed

## Decision log
- <decisions / assumptions made by agents, newest first>

## Open questions
- <unresolved questions for the human>

## Feedback / loops
- <test failures and developer fixes, newest first>
```
