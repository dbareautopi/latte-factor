# Spec-Driven Development (SDD) Workflow

A multi-agent workflow for developing features from specifications to working code.

## Overview

SDD separates development into two phases:

1. **Phase 1: Interactive Spec** — You refine the Gherkin specification with pi
2. **Phase 2: Implementation** — Agents handle contract, tests, and code

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Interactive (You + Pi)                                │
│                                                                 │
│  /sdd expense-tracking  →  Chat about feature  →  /sdd-save    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: Automated (Subagents)                                 │
│                                                                 │
│  Step-by-step:  /sdd-next → /sdd-phase-complete → ...          │
│  OR                                                          │
│  Auto:          /sdd-auto → (runs until failure)                │
│                                                                 │
│  contract → unit-tests → e2e-tests → implementation → review   │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Pi with subagent extension loaded (`/reload` if needed)
- Backend project structure in `backend/`
- Go toolchain installed (for running tests)

## Quick Start

```bash
# 1. Start a new feature
/sdd expense-tracking

# 2. Describe your feature (interactive conversation)
"Users should track expenses with amount, category, and date..."

# 3. Save the spec when ready
/sdd-save

# 4. Choose your mode:
/sdd-auto                    # Fully automated (for simple features)
# OR
/sdd-next                    # Step-by-step (for complex features)
```

## Commands Reference

### Phase 1: Spec Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/sdd <name>` | Start new feature | `/sdd expense-tracking` |
| `/sdd-save [gherkin]` | Save Gherkin spec | `/sdd-save` or `/sdd-save Feature: ...` |
| `/sdd-edit-spec` | Edit existing spec | `/sdd-edit-spec` |

### Phase 2: Implementation Commands

| Command | Description | When to use |
|---------|-------------|-------------|
| `/sdd-next` | Start implementation (step mode) | Complex features |
| `/sdd-auto` | Run full implementation (auto mode) | Simple features |
| `/sdd-phase-complete` | Advance to next phase | Step mode only |
| `/sdd-feedback <details>` | Report failure | When tests fail |
| `/sdd-status` | Check current phase | Anytime |
| `/sdd-complete` | Force complete | Skip remaining phases |

## Phase 1: Interactive Spec

### Starting a Feature

```bash
/sdd expense-tracking
```

This creates:
```
specs/expense-tracking/
├── behavior.feature        # (empty, you'll fill this)
├── contracts/
│   └── examples/
│       ├── requests/
│       └── responses/
└── tests/
    ├── unit/
    └── e2e/
```

### Refining the Spec

Chat with pi about your feature:

```
You: Users should be able to add expenses with amount, description, and category.
     They should see a list of all expenses sorted by date.
     They should be able to filter by category.

Pi: (helps refine into Gherkin scenarios)
    - Scenario: Add new expense
    - Scenario: Add expense with invalid amount
    - Scenario: List expenses
    - Scenario: Filter by category
    ...
```

### Saving the Spec

When you're happy with the Gherkin:

```bash
/sdd-save
```

Or paste the Gherkin directly:

```bash
/sdd-save Feature: Expense Tracking
  As a user
  I want to track expenses
  ...
```

### Editing the Spec

```bash
/sdd-edit-spec
```

Pi will show the current spec and ask what to change.

## Phase 2: Implementation

### Step-by-Step Mode

Best for complex features where you want to review each phase:

```bash
/sdd-next                    # Start with contract
# contract-dev creates OpenAPI...
# When done:

/sdd-phase-complete          # Advance to unit tests
# qa-engineer creates unit tests...
# When done:

/sdd-phase-complete          # Advance to e2e tests
# qa-engineer creates e2e tests...
# When done:

/sdd-phase-complete          # Advance to implementation
# developer writes code...
# When done:

/sdd-phase-complete          # Advance to test run
# qa-engineer runs tests...
# When done:

/sdd-phase-complete          # Advance to review
# reviewer checks code...
# When done:

/sdd-complete                # Finish
```

### Fully Automated Mode

Best for simple features where you trust the agents:

```bash
/sdd-auto
# Runs all phases automatically:
# contract → unit-tests → e2e-tests → implementation → test-run → review
# Stops only if:
#   - Tests fail
#   - Critical review issues
#   - Agent errors
```

### Handling Failures

If tests fail:

```bash
/sdd-feedback "Validation error: amount must be positive"
# Loops back to developer to fix
# Then continues from implementation phase
```

## Workflow Phases

| Phase | Agent | Input | Output |
|-------|-------|-------|--------|
| contract | contract-dev | Gherkin | `contracts/openapi.yaml` |
| unit-tests | qa-engineer | Gherkin + Contract | `tests/unit/*.test.ts` |
| e2e-tests | qa-engineer | Gherkin + Contract | `tests/e2e/*.e2e.test.ts` |
| implementation | developer | Contract + Tests | Code in `backend/internal/` |
| test-run | qa-engineer | Tests | Pass/fail results |
| review | reviewer | Everything | Review report |

## File Structure

### During Development

```
specs/
└── expense-tracking/
    ├── behavior.feature              # Your Gherkin spec
    ├── contracts/
    │   ├── openapi.yaml              # API contract
    │   └── examples/
    │       ├── requests/
    │       │   └── create-expense.json
    │       └── responses/
    │           ├── expense.json
    │           └── error.json
    └── tests/
        ├── unit/
        │   └── expense.test.ts
        └── e2e/
            └── expense.e2e.test.ts

backend/
└── internal/
    └── domain/
        └── model/
            └── expense.go           # Implementation
```

### After Completion

```
specs/expense-tracking/
├── behavior.feature              # ✅ Source of truth
├── contracts/
│   └── openapi.yaml              # ✅ Interface contract
└── tests/                        # ✅ Test definitions

backend/internal/                 # ✅ Working implementation
```

## Agent Roles

| Agent | Responsibility | Can Write To |
|-------|---------------|--------------|
| analyst | Create Gherkin specs | `specs/<name>/` |
| contract-dev | Create OpenAPI contracts | `specs/<name>/contracts/` |
| qa-engineer | Create and run tests | `specs/<name>/tests/` |
| developer | Implement code | `backend/internal/` |
| reviewer | Review code quality | (read-only) |

### Path Protection

Agents are **blocked** from writing to:
- `frontend/` — Your teammate's domain
- `backend/` (except developer agent)
- Other agents' directories

## Troubleshooting

### "No spec found"

You haven't saved the Gherkin yet. Run `/sdd-save` first.

### "No active SDD workflow"

Start a new workflow: `/sdd <feature-name>`

### Tests fail in auto mode

Auto mode stops on failure. Use:

```bash
/sdd-feedback "error details"
```

This loops back to the developer agent to fix the issue.

### Agent wrote to wrong directory

The path protection should block this. If it happens, check:

```bash
/reload  # Reload extensions
```

### Want to start over

```bash
rm -rf specs/<feature-name>/
/sdd <feature-name>
```

## Tips

1. **Simple features** → Use `/sdd-auto` for speed
2. **Complex features** → Use `/sdd-next` to review each phase
3. **Unclear requirements** → Spend more time in Phase 1
4. **Test failures** → Provide detailed error messages in `/sdd-feedback`
5. **Review feedback** → Only critical issues block completion

## Example: Complete Workflow

```bash
# Phase 1: Spec
/sdd expense-tracking
"Users track expenses with amount, category, date..."
/sdd-save

# Phase 2: Auto (simple feature)
/sdd-auto

# ... agent runs ...

# If tests fail:
/sdd-feedback "amount validation: must be positive"

# ... agent fixes ...

# Complete!
```

## Example: Step-by-Step Workflow

```bash
# Phase 1: Spec
/sdd expense-tracking
"Users track expenses..."
/sdd-save

# Phase 2: Step-by-step (complex feature)
/sdd-next
# Review contract...
/sdd-phase-complete

# Review unit tests...
/sdd-phase-complete

# Review e2e tests...
/sdd-phase-complete

# Review implementation...
/sdd-phase-complete

# Check test results...
/sdd-phase-complete

# Review code...
/sdd-complete
```
