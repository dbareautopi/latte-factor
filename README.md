# Latte Factor

[![CI](https://github.com/dbareautopi/latte-factor/actions/workflows/ci.yml/badge.svg)](https://github.com/dbareautopi/latte-factor/actions/workflows/ci.yml)

Monorepo with separate frontend and backend.

## Structure

```
├── frontend/          # Angular
│   └── AGENTS.md      # Structure and conventions guide
├── backend/           # Go — DDD Hexagonal Architecture
│   └── CLAUDE.md      # Stack & conventions (auto-loaded in backend/)
├── contracts/         # API contracts grouped by domain
│   └── README.md      # Contract conventions
├── specs/             # Spec-Driven Development workspace
│   └── README.md      # SDD workflow guide
├── .claude/
│   ├── agents/        # SDD subagents (source of truth for the workflow)
│   │   ├── analyst.md       # Gherkin specs
│   │   ├── contract-dev.md  # OpenAPI contracts
│   │   ├── qa-engineer.md   # RED tests + run
│   │   ├── developer.md     # Go implementation
│   │   └── reviewer.md      # Code review (read-only)
│   └── commands/      # /sdd, /sdd-next, /sdd-auto, /sdd-status
├── CLAUDE.md          # Project-wide guidance (auto-loaded)
└── README.md
```

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | Angular + TypeScript + RxJS           |
| Backend   | Go — DDD Hexagonal Architecture       |
| Database  | PostgreSQL                            |

## Spec-Driven Development (SDD)

The workflow runs on **Claude Code subagents** defined in [.claude/agents/](.claude/agents/),
orchestrated by the **slash commands** in [.claude/commands/](.claude/commands/).
Each agent owns one phase and a strict write boundary. A per-feature
`specs/<name>/STATUS.md` tracks progress and carries decisions across the
(isolated) agents.

### Commands

| Command | Description |
|---------|-------------|
| `/sdd <name> [desc]` | Scaffold a feature + `STATUS.md` and start the `analyst` |
| `/sdd-next [name]` | Run the next pending phase (step mode, review between) |
| `/sdd-auto [name]` | Run all remaining phases, stopping on failure |
| `/sdd-status [name]` | Show progress (all features, or one in detail) |

You can also invoke any agent by name directly, or let Claude Code auto-delegate.

### Workflow Phases

| # | Phase | Agent | Input | Output |
|---|-------|-------|-------|--------|
| 1 | Spec | `analyst` | Requirements | `specs/<name>/backend/behavior.feature` |
| 2 | Contract | `contract-dev` | Gherkin | `specs/<name>/contract/openapi.yaml` |
| 3 | Tests (RED) | `qa-engineer` | Gherkin + contract | godog steps (`backend/test/acceptance/`) + unit `*_test.go` |
| 4 | Implementation | `developer` | Contract + tests | Code in `backend/internal/` |
| 5 | Test run | `qa-engineer` | Tests | `make verify` report |
| 6 | Review | `reviewer` | Everything | Review report (read-only) |

The Gherkin `.feature` is **executable**: godog runs it directly, so the spec
can't drift from the tests. Go unit tests are **co-located** with the code.

### Path Protection

Each agent writes only to its own area:

| Agent | Writes to |
|-------|-----------|
| analyst | `specs/<name>/backend/` |
| contract-dev | `specs/<name>/contract/` |
| qa-engineer | `backend/**/*_test.go` + `backend/test/` |
| developer | `backend/` (non-test `.go`) |
| reviewer | nothing (read-only) |

### Quality Gate

The objective bar lives in [`backend/Makefile`](backend/Makefile):

```bash
make -C backend verify         # gofmt, go vet, golangci-lint, unit + godog, coverage
make -C backend contract-lint  # Spectral lint over the OpenAPI contracts
make -C backend install-tools  # install golangci-lint (one-off)
```

A feature is **done** when `make verify` is green. The `reviewer` runs the gate
as evidence before any judgment review.

**CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs the exact same
`make verify` + `make contract-lint` on every push and pull request, so CI and
local stay in lockstep.

## Commit Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code change without behavior change
- `docs:` documentation
- `test:` tests
- `chore:` build/config tasks

## Guides

- [SDD Agents](.claude/agents/) — Workflow agents (source of truth)
- [Frontend](frontend/AGENTS.md) — Angular
- [Backend](backend/CLAUDE.md) — Go DDD Hexagonal
- [Contracts](contracts/README.md) — API contracts
- [Specs](specs/README.md) — Spec directory
