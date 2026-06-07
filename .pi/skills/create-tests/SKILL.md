---
name: create-tests
description: Step-by-step workflow for creating red (failing) unit and e2e tests from specs and contracts.
---

# How to Create Tests

## Step 1: Read Source Documents

Read:
- `features/<name>/specs/behavior.feature`
- `features/<name>/contracts/openapi.yaml`

## Step 2: Map Gherkin to Tests

| Gherkin | Unit Test | E2E Test |
|---------|-----------|----------|
| Scenario | describe block | describe block |
| Given | beforeEach / setup | beforeAll / seed data |
| When | function call | HTTP request |
| Then | expect assertions | response assertions |
| Scenario Outline | it.each / test.each | it.each with data |

## Step 3: Create Unit Tests

Save to `specs/<name>/tests/unit/<resource>.test.ts`:

**IMPORTANT:** Only write to `specs/` directory. Never write to `frontend/` or `backend/`.

```typescript
import { describe, it, expect } from 'vitest';

describe('<Resource> Domain', () => {
  describe('create <resource>', () => {
    it('should create with valid data', async () => {
      // Arrange - from Gherkin "Given"
      const input = { /* valid data */ };
      
      // Act - from Gherkin "When"
      const result = await createResource(input);
      
      // Assert - from Gherkin "Then"
      expect(result).toHaveProperty('id');
      expect(result.amount).toBe(input.amount);
    });

    it('should reject invalid data', async () => {
      // Arrange - from Gherkin error scenario
      const input = { amount: -10 };
      
      // Act & Assert
      await expect(createResource(input))
        .rejects
        .toThrow('Amount must be positive');
    });
  });
});
```

## Step 4: Create E2E Tests

Save to `features/<name>/tests/e2e/<resource>.e2e.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

describe('<Resource> API', () => {
  let server: any;
  
  beforeAll(() => {
    server = createTestServer();
  });

  describe('POST /api/v1/<resources>', () => {
    it('should return 201 with valid body', async () => {
      const response = await request(server)
        .post('/api/v1/<resources>')
        .send({ /* valid data from contract */ })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        // ... schema from OpenAPI
      });
    });

    it('should return 400 with invalid body', async () => {
      await request(server)
        .post('/api/v1/<resources>')
        .send({ amount: -10 })
        .expect(400);
    });

    it('should return 401 without auth', async () => {
      await request(server)
        .post('/api/v1/<resources>')
        .send({ /* data */ })
        .expect(401);
    });
  });
});
```

## Step 5: Validate

Check:
- [ ] Every Gherkin scenario has a test
- [ ] Happy path AND error cases covered
- [ ] Tests reference correct endpoints from contract
- [ ] Tests use example data from contract
- [ ] Tests will FAIL without implementation (red phase)

## Test Conventions

- **Unit tests**: `*.test.ts` or `*.spec.ts`
- **E2E tests**: `*.e2e.test.ts`
- **Test data**: Use factories, not hardcoded values
- **Assertions**: Descriptive expect messages
- **Cleanup**: Always clean up test data
