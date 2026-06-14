---
description: Show SDD progress for a feature (or all features)
argument-hint: [feature-name]
allowed-tools: Read, Bash, Grep, Glob
---

Report SDD progress. Raw input: `$ARGUMENTS` (optional feature name).

- **No name:** list every `specs/*/STATUS.md` with its feature name, current
  phase, and a compact phase status line (e.g. `✅✅🔄⬜⬜⬜`).
- **With a name:** print the full `specs/<name>/STATUS.md` (phase table,
  decision log, open questions, feedback loops) and state the next command to run
  (`/sdd-next`, `/sdd-auto`, or "complete").

Read-only: do not modify any file. If a named feature has no STATUS.md, say so
and suggest `/sdd <name>` to start it.
