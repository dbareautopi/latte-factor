# CLAUDE.md

Project-wide guidance for **Latte Factor**. Auto-loaded by Claude Code.
Backend-specific stack & conventions live in [`backend/CLAUDE.md`](backend/CLAUDE.md)
(auto-loaded when working inside `backend/`).

## Project

- **Monorepo:** `backend/` (Go, DDD Hexagonal, **chi** router) and `frontend/`
  (Angular). **SDD is backend-only for now — do not scaffold or touch `frontend/`.**
- **Contracts** in `specs/<feature>/contract/openapi.yaml` are the shared source
  of truth for the API.

## Spec-Driven Development (SDD)

Features are built phase by phase by the subagents in
[`.claude/agents/`](.claude/agents/), orchestrated by the slash commands in
[`.claude/commands/`](.claude/commands/):
`/sdd <name>` → `/sdd-next` (step) or `/sdd-auto` (run the rest) → `/sdd-status`.

| Phase | Agent | Output |
|-------|-------|--------|
| Spec | `analyst` | `specs/<name>/backend/behavior.feature` (Gherkin, executable via godog) |
| Contract | `contract-dev` | `specs/<name>/contract/openapi.yaml` |
| Tests (RED) | `qa-engineer` | godog steps + co-located `*_test.go` |
| Implementation | `developer` | `backend/internal/...` |
| Test run | `qa-engineer` | `make -C backend verify` |
| Review | `reviewer` | gate + judgment review |

A per-feature `specs/<name>/STATUS.md` carries decisions across the isolated
agents. **A feature is done when `make -C backend verify` is green.**

---

## Working principles

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
