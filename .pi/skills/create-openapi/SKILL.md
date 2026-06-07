---
name: create-openapi
description: Step-by-step workflow for creating OpenAPI contracts from Gherkin behavioral specs.
---

# How to Create OpenAPI Contracts

## Step 1: Read the Gherkin File

Read `features/<name>/specs/behavior.feature`

## Step 2: Map Scenarios to Endpoints

| Gherkin Pattern | HTTP Method | Endpoint |
|-----------------|-------------|----------|
| "add/create/insert" | POST | `POST /api/v1/<resource>` |
| "view/see/list" | GET | `GET /api/v1/<resources>` |
| "update/change" | PUT/PATCH | `PUT /api/v1/<resource>/{id}` |
| "delete/remove" | DELETE | `DELETE /api/v1/<resource>/{id}` |
| "search/filter" | GET | `GET /api/v1/<resources>?filters` |

## Step 3: Create OpenAPI Structure

Template:

```yaml
openapi: "3.1.0"
info:
  title: "<Feature Name>"
  description: "API contract for <feature>"
  version: "0.1.0"

paths:
  /api/v1/<resource>:
    post:
      operationId: create<Resource>
      summary: "Create a new <resource>"
      tags: [<Feature>]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Create<Resource>Request"
      responses:
        "201":
          description: "Resource created"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/<Resource>"
        "400":
          $ref: "#/components/responses/ValidationError"
        "401":
          $ref: "#/components/responses/Unauthorized"

components:
  schemas:
    <Resource>:
      type: object
      required: [id, createdAt]
      properties:
        id:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time

    Create<Resource>Request:
      type: object
      required: [/* from Gherkin When step */]
      properties:
        # ... fields from Gherkin

  responses:
    ValidationError:
      description: "Validation failed"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    Unauthorized:
      description: "Not authenticated"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
        message:
          type: string
```

## Step 4: Create Examples

Save to `specs/<name>/contracts/examples/`:

**IMPORTANT:** Only write to `specs/` directory. Never write to `frontend/` or `backend/`.

```
examples/
├── requests/
│   └── create-<resource>.json
└── responses/
    ├── <resource>-created.json
    └── error-validation.json
```

## Step 5: Validate

Check:
- [ ] Every Gherkin scenario has an endpoint
- [ ] All "Then" assertions in response schemas
- [ ] Error cases have proper HTTP codes
- [ ] Examples match Gherkin data
- [ ] operationIds are unique

## Naming Conventions

- **operationId**: camelCase, verb + noun (`createExpense`)
- **Schemas**: PascalCase (`Expense`, `CreateExpenseRequest`)
- **Paths**: kebab-case, plural (`/api/v1/expense-categories`)
- **Tags**: PascalCase (`Expenses`)
