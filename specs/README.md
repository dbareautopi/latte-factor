# Specs — Spec-Driven Development

All feature specifications live here. Each feature gets its own folder.

## Structure

```
specs/
└── <feature-name>/
    ├── behavior.feature        # Gherkin behavioral spec
    ├── contracts/
    │   ├── openapi.yaml        # API contract
    │   └── examples/           # Request/response examples
    └── tests/
        ├── unit/               # Unit tests
        └── e2e/                # E2E tests
```

## Workflow

### Phase 1: Interactive Spec

```bash
/sdd expense-tracking          # Create feature directory
# Chat with pi to describe your feature
/sdd-save                      # Save Gherkin spec
/sdd-edit-spec                 # Edit if needed
```

### Phase 2: Implementation (choose one)

**Option A: Step-by-step** (review each phase)
```bash
/sdd-next                      # Start implementation
/sdd-phase-complete            # Advance after reviewing
```

**Option B: Fully automated** (runs until failure)
```bash
/sdd-auto                      # Runs everything automatically
```

## Commands

| Command | Description |
|---------|-------------|
| `/sdd <name>` | Start new feature (name: lowercase, kebab-case) |
| `/sdd-save [gherkin]` | Save spec (with content or from conversation) |
| `/sdd-edit-spec` | Edit the Gherkin |
| `/sdd-next` | Start implementation (step-by-step mode) |
| `/sdd-auto` | Run full implementation automatically |
| `/sdd-phase-complete` | Advance to next phase (step-by-step mode) |
| `/sdd-feedback <details>` | Report failure, loop to developer |
| `/sdd-status` | Show current phase |
| `/sdd-complete` | Force complete |

## Phase Order

```
spec → contract → unit-tests → e2e-tests → implementation → test-run → review → complete
```

## Conventions

- Feature names: `kebab-case` (e.g., `expense-tracking`)
- Gherkin: source of truth for behavior
- OpenAPI: source of truth for interface
- Implementation: `backend/` (Go) and `frontend/` (Angular)
