# SDD Quick Reference

## Commands

```
/sdd <name>              Start new feature
/sdd-save [gherkin]      Save spec
/sdd-edit-spec           Edit spec
/sdd-next                Start implementation (step mode)
/sdd-auto                Start implementation (auto mode)
/sdd-phase-complete      Advance to next phase
/sdd-feedback <details>  Report failure
/sdd-status              Check progress
/sdd-complete            Force complete
```

## Flow

```
Phase 1: /sdd → chat → /sdd-save
Phase 2: /sdd-auto (or /sdd-next + /sdd-phase-complete)
```

## File Locations

```
specs/<name>/backend/behavior.feature      # Gherkin spec
specs/<name>/contract/openapi.yaml        # API contract (shared)
specs/<name>/backend/tests/unit/           # Unit tests
specs/<name>/backend/tests/e2e/            # E2E tests
backend/internal/                          # Implementation
```

## Failure Loop

```
Tests fail → /sdd-feedback → developer fixes → continues
```

## Tips

- Simple features: `/sdd-auto`
- Complex features: `/sdd-next`
- Provide detailed errors in `/sdd-feedback`
