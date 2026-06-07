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
├── .pi/
│   ├── agents/        # Agent definitions (WHAT)
│   │   ├── analyst.md
│   │   ├── contract-dev.md
│   │   ├── qa-engineer.md
│   │   ├── developer.md
│   │   └── reviewer.md
│   ├── skills/        # Workflow steps (HOW)
│   │   ├── create-gherkin/
│   │   ├── create-openapi/
│   │   ├── create-tests/
│   │   ├── implement-code/
│   │   └── review-code/
│   └── extensions/
│       └── sdd-coordinator.ts  # Orchestrator
└── README.md
```

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | Angular + TypeScript + RxJS           |
| Backend   | Go — DDD Hexagonal Architecture       |
| Database  | PostgreSQL                            |

## Spec-Driven Development (SDD)

Two-phase workflow: interactive spec refinement, then automated implementation.

### Phase 1: Interactive Spec

```bash
/sdd expense-tracking              # Start workflow
# Chat with pi to refine your Gherkin spec
/sdd-save <gherkin content>        # Save when ready
```

### Phase 2: Implementation (choose one)

**Step-by-step** (review each phase):
```bash
/sdd-next              # Start
/sdd-phase-complete    # Advance after reviewing
```

**Fully automated** (runs until failure):
```bash
/sdd-auto              # Runs everything automatically
```

### Workflow Phases

1. **Spec** (interactive) → Refine Gherkin with pi
2. **Contract Dev** (subagent) → OpenAPI from Gherkin
3. **QA Engineer** (subagent) → Red unit + e2e tests
4. **Developer** (subagent) → Green code
5. **QA Engineer** (subagent) → Run tests
6. **Reviewer** (subagent) → Code quality check

### Agents

| Agent | Role |
|-------|------|
| analyst | Creates behavioral specifications |
| contract-dev | Creates OpenAPI contracts |
| qa-engineer | Creates and runs tests |
| developer | Implements code |
| reviewer | Reviews code quality |

## Commit Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code change without behavior change
- `docs:` documentation
- `test:` tests
- `chore:` build/config tasks

## Guides

- [SDD Workflow](.pi/SDD.md) — Full documentation
- [Frontend](frontend/AGENTS.md) — Angular
- [Backend](backend/AGENTS.md) — Go DDD Hexagonal
- [Contracts](contracts/README.md) — API contracts
- [Specs](specs/README.md) — Spec directory
