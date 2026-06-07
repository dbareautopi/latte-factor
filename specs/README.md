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
    │   └── responses/
    ├── backend/                 # BACKEND specific
    │   ├── behavior.feature     # Gherkin spec
    │   └── tests/
    │       ├── unit/
    │       └── e2e/
    └── frontend/                # FRONTEND specific (reserved)
        └── (Angular components, routes, etc.)
```

## Who Uses What

| Directory | Used By | Contains |
|-----------|---------|----------|
| `contract/` | Frontend + Backend | API contract (source of truth for interface) |
| `backend/` | Backend only | Gherkin, tests, implementation specs |
| `frontend/` | Frontend only | Angular component specs, routes, etc. |

## Workflow

### Phase 1: Interactive Spec

```bash
/sdd expense-tracking          # Create feature directory
# Chat with pi to describe your feature
/sdd-save                      # Save Gherkin spec
```

### Phase 2: Implementation

```bash
/sdd-auto                      # Fully automated
# OR
/sdd-next                      # Step-by-step
```

## Commands

| Command | Description |
|---------|-------------|
| `/sdd <name>` | Start new feature |
| `/sdd-save [gherkin]` | Save spec |
| `/sdd-edit-spec` | Edit spec |
| `/sdd-next` | Start implementation (step mode) |
| `/sdd-auto` | Start implementation (auto mode) |
| `/sdd-phase-complete` | Advance to next phase |
| `/sdd-feedback <details>` | Report failure |
| `/sdd-status` | Check progress |
| `/sdd-complete` | Force complete |

## Conventions

- Feature names: `kebab-case` (e.g., `expense-tracking`)
- Contracts: shared between frontend and backend
- Gherkin: backend only (drives API implementation)
- Frontend directory: reserved for future Angular work
