---
description: Run the next pending SDD phase for a feature (step mode, review between phases)
argument-hint: [feature-name]
allowed-tools: Task, Read, Write, Edit, Bash, Grep, Glob
---

Advance one phase of the SDD workflow. Raw input: `$ARGUMENTS` (optional feature name).

## Resolve the feature
1. If a name is given, use `specs/<name>/STATUS.md`.
2. Otherwise find the single feature whose STATUS.md is not fully `✅`. If there
   are several, list them and ask which one.

## Run exactly ONE phase
Read STATUS.md, find the first phase that is not `✅ done`, and run it. Always:
mark it `🔄`, invoke the subagent via the Task tool (telling it to read STATUS.md
first), then on success mark it `✅`, update **Current phase**, and append any
decisions / open questions. Stop and report after this single phase.

| Phase | Subagent | Action | Done when |
|-------|----------|--------|-----------|
| 1 Spec | `analyst` | Write `behavior.feature` | Gherkin saved |
| 2 Contract | `contract-dev` | Write `openapi.yaml` (3.0.3) + examples | contract covers every scenario |
| 2b Codegen | _(orchestrator, no agent)_ | Run `make -C backend generate`, commit the `*.gen.go` | generated chi server compiles |
| 3 Tests (RED) | `qa-engineer` | godog steps + co-located unit tests | `make -C backend verify` fails **on the new tests** (RED confirmed) |
| 4 Implementation | `developer` | Implement in `backend/internal/` | code written, aiming for GREEN |
| 5 Test run | `qa-engineer` | Run `make -C backend verify` | gate is GREEN |
| 6 Review | `reviewer` | `make verify` + `make contract-lint` + judgment | status ✅ Approved / ⚠️ |

## Feedback loops
- **Phase 5 fails** (`make verify` red): mark phase 4 `❌`, log the failure under
  Feedback / loops, and re-run the `developer` subagent with the exact errors.
  Repeat 4↔5 until green. Don't advance to review on a red gate.
- **Phase 6 requests changes** (critical issues): log them, set phase 4 `🔄`, and
  loop back to `developer`, then re-run 5 and 6.

After the phase, report what ran, the new STATUS, and the next command to use.
When phase 6 is ✅, tell the user the feature is complete.
