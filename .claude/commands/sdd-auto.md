---
description: Run all remaining SDD phases for a feature automatically, stopping on failure
argument-hint: [feature-name]
allowed-tools: Task, Read, Write, Edit, Bash, Grep, Glob
---

Run the SDD workflow to completion. Raw input: `$ARGUMENTS` (optional feature name).

Resolve the feature exactly like `/sdd-next` (named, or the single unfinished one;
ask if ambiguous). Set **Mode: auto** in STATUS.md.

## Loop
Run phases in order from the first non-`✅` phase, using the same phase→subagent
mapping, RED check, and feedback loops as `/sdd-next` — including the **2b codegen**
step (`make -C backend generate` + commit the `*.gen.go`) after the contract and
before tests. After each phase, update STATUS.md (status, Current phase, Decision
log, Open questions) before continuing.

Each subagent runs isolated — always tell it to read `specs/<name>/STATUS.md`
first so upstream decisions carry across phases.

## Stop conditions (halt and report — do NOT force past these)
- The `analyst` has unresolved clarifying questions.
- Phase 3 does not go RED (tests pass without implementation → tests are wrong).
- The 4↔5 developer/test loop fails to reach GREEN after **3** attempts.
- The `reviewer` reports **critical** issues that the developer can't auto-resolve.
- Any subagent errors or a write would land outside its allowed path.

On a stop: leave STATUS.md reflecting reality (mark the phase `❌`, log details
under Feedback / loops) and tell the user exactly what blocked and how to resume
(`/sdd-next` after they weigh in, or re-run `/sdd-auto`).

On success (phase 6 ✅): report the green `make verify` summary, coverage, the
review verdict, and the artifacts produced.
