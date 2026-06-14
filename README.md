# Latte Factor

Monorepo with separate frontend and backend.

## Structure

```
├── frontend/          # Angular
│   └── AGENTS.md      # Structure and conventions guide
├── backend/           # Go — DDD Hexagonal Architecture
│   └── AGENTS.md      # Structure and conventions guide
├── contracts/         # API contracts grouped by domain
│   └── README.md      # Contract conventions
├── specs/             # Spec-Driven Development workspace
│   └── README.md      # SDD workflow guide
├── .claude/
│   └── agents/        # SDD subagents (source of truth for the workflow)
│       ├── analyst.md       # Gherkin specs
│       ├── contract-dev.md  # OpenAPI contracts
│       ├── qa-engineer.md   # RED tests + run
│       ├── developer.md     # Go implementation
│       └── reviewer.md      # Code review (read-only)
└── README.md
```

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | Angular + TypeScript + RxJS           |
| Backend   | Go — DDD Hexagonal Architecture       |
| Database  | PostgreSQL                            |

## Spec-Driven Development (SDD)

The workflow runs on **Claude Code subagents** defined in [.claude/agents/](.claude/agents/).
Each agent owns one phase and a strict write boundary. Invoke an agent by name
(or let Claude Code auto-delegate based on the task), reviewing the output
between phases.

### Workflow Phases

| # | Phase | Agent | Input | Output |
|---|-------|-------|-------|--------|
| 1 | Spec | `analyst` | Requirements | `specs/<name>/backend/behavior.feature` |
| 2 | Contract | `contract-dev` | Gherkin | `specs/<name>/contract/openapi.yaml` |
| 3 | Tests (RED) | `qa-engineer` | Gherkin + contract | `specs/<name>/backend/tests/` |
| 4 | Implementation | `developer` | Contract + tests | Code in `backend/internal/` |
| 5 | Test run | `qa-engineer` | Tests | Pass/fail report |
| 6 | Review | `reviewer` | Everything | Review report (read-only) |

### Path Protection

Each agent writes only to its own area:

| Agent | Writes to |
|-------|-----------|
| analyst | `specs/<name>/backend/` |
| contract-dev | `specs/<name>/contract/` |
| qa-engineer | `specs/<name>/backend/tests/` |
| developer | `backend/` |
| reviewer | nothing (read-only) |

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
- [Backend](backend/AGENTS.md) — Go DDD Hexagonal
- [Contracts](contracts/README.md) — API contracts
- [Specs](specs/README.md) — Spec directory
