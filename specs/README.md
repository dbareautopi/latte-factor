# Specs — Spec-Driven Development

All feature specifications live here. This is a **project-wide** directory used by both frontend and backend.

## Structure

```
specs/
└── <feature-name>/
    ├── contract/               # SHARED API contract
    │   ├── openapi.yaml
    │   └── examples/
    │       ├── requests/
    │       └── responses/
    ├── backend/                 # BACKEND specific
    │   └── behavior.feature     # Gherkin spec — EXECUTABLE via godog
    └── frontend/                # FRONTEND specific (reserved)
        └── (Angular components, routes, etc.)
```

> **Tests do not live here.** The `.feature` is run directly by godog
> (`make -C backend acceptance`). Go **unit tests are co-located** with the code
> in `backend/internal/.../*_test.go`, and godog **step definitions** live in
> `backend/test/acceptance/`. This is required: Go `internal/` packages can only
> be imported from within `backend/`.

## Who Uses What

| Directory | Used By | Contains |
|-----------|---------|----------|
| `contract/` | Frontend + Backend | API contract (source of truth for interface) |
| `backend/` | Backend only | Gherkin behavior spec (executable via godog) |
| `frontend/` | Frontend only | Angular component specs, routes, etc. |

## Workflow

Driven by the slash commands in [`.claude/commands/`](../.claude/commands/) —
`/sdd <name>` to start, then `/sdd-next` (step) or `/sdd-auto` (run the rest),
`/sdd-status` to check progress. A per-feature `STATUS.md` tracks state and
carries decisions across the isolated agents in
[`.claude/agents/`](../.claude/agents/). The phases:

1. `analyst` → `specs/<name>/backend/behavior.feature`
2. `contract-dev` → `specs/<name>/contract/openapi.yaml`
3. `qa-engineer` → RED godog steps (`backend/test/acceptance/`) + unit tests (`backend/internal/.../*_test.go`)
4. `developer` → implementation in `backend/internal/` until `make verify` is GREEN
5. `qa-engineer` → run `make -C backend verify`
6. `reviewer` → `make verify` + `make contract-lint`, then judgment review

## Conventions

- Feature names: `kebab-case` (e.g., `expense-tracking`)
- Contracts: shared between frontend and backend; linted with Spectral
- Gherkin: backend only, executable via godog (drives API implementation)
- Frontend directory: reserved for future Angular work
