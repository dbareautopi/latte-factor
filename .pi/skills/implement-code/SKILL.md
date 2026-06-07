---
name: implement-code
description: Step-by-step workflow for implementing code to make failing tests pass with TDD.
---

# How to Implement Code

## Step 1: Read Source Documents

Read:
- `features/<name>/contracts/openapi.yaml`
- `features/<name>/tests/unit/`
- `features/<name>/tests/e2e/`

## Step 2: Confirm Red Phase

Run tests to verify they fail:

```bash
npm test 2>&1 | head -50
```

## Step 3: Implement Incrementally

Follow TDD cycle:

```
1. Run specific test: npm test -- -t "test name"
2. Write minimal code to make it pass
3. Run test again to confirm green
4. Refactor if needed (tests still pass)
5. Commit with conventional commit
```

## Step 4: Implementation Order

Follow this order to minimize dependencies:

1. **Value Objects / Entities** (pure data structures)
2. **Repository interfaces** (ports)
3. **Use Cases / Services** (business logic)
4. **Repository implementations** (adapters)
5. **API Handlers** (controllers)
6. **Integration / glue code**

**IMPORTANT:** Only write to `backend/` directory. NEVER write to `frontend/`.

## Step 5: Code Quality Rules

- **Minimal code**: Write only what's needed to pass tests
- **Follow contract**: Response must match OpenAPI schema exactly
- **No shortcuts**: Don't skip error handling
- **Clean code**: Readable, well-named, small functions

## Step 6: Commit Convention

Each logical change = one commit:

```bash
# Feature implementation
git commit -m "feat(expenses): add create expense use case"

# Bug fix discovered during testing
git commit -m "fix(expenses): validate amount is positive"

# Refactoring after tests pass
git commit -m "refactor(expenses): extract validation logic"

# Adding missing test
git commit -m "test(expenses): add edge case for zero amount"
```

**Rules:**
- One commit per use case / feature
- One commit per bug fix
- One commit per refactoring step
- Never mix feature + fix in same commit

## Step 7: Verify

After all code is written:

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

## Code Structure (DDD Hexagonal)

```
internal/
├── domain/
│   ├── model/          # Entities, Value Objects
│   ├── repository/     # Interfaces (ports)
│   ├── service/        # Use cases
│   └── error/          # Domain errors
├── infrastructure/
│   ├── persistence/    # Repository implementations
│   └── external/       # External services
├── application/
│   └── dto/            # Data Transfer Objects
└── interfaces/
    ├── http/           # Handlers, routes
    └── middleware/     # Auth, logging
```
