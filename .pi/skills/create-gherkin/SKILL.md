---
name: create-gherkin
description: Step-by-step workflow for creating Gherkin behavioral specifications from requirements.
---

# How to Create Gherkin Specs

## Step 1: Gather Requirements

Ask the user these questions (if not already provided):

```
1. What is the main goal of this feature?
2. Who is the target user?
3. What are the key actions they should be able to do?
4. What should happen in the happy path?
5. What could go wrong? (error cases)
6. Any edge cases to consider?
```

## Step 2: Identify Scenarios

For each user action, create a scenario:

| User Intent | Scenario Type |
|-------------|---------------|
| Create something | Happy path + validation errors |
| View/List something | Happy path + empty state + not found |
| Update something | Happy path + not found + validation |
| Delete something | Happy path + not found + confirmation |
| Search/Filter | Happy path + no results |

## Step 3: Write Gherkin

Template:

```gherkin
Feature: <Feature Name>
  As a <user type>
  I want to <action>
  So that <benefit>

  Background:
    Given <common preconditions>

  Scenario: <Happy path>
    Given <initial state>
    When <action>
    Then <expected result>

  Scenario: <Error case>
    Given <initial state>
    When <action that fails>
    Then <error response>
    And <user feedback>

  Scenario Outline: <Variations>
    When <action with "<input>">
    Then <result>

    Examples:
      | input | result |
      | ...   | ...    |
```

## Step 4: Validate

Check each scenario:
- [ ] One behavior per scenario
- [ ] Given-When-Then strictly followed
- [ ] Steps are small and testable
- [ ] No implementation details
- [ ] Error cases covered

## Step 5: Save File

Save to: `specs/<name>/behavior.feature`

**IMPORTANT:** Only write to `specs/` directory. Never write to `frontend/` or `backend/`.

## Example

```gherkin
Feature: Expense Tracking
  As a personal finance user
  I want to record my expenses
  So that I can track my spending

  Background:
    Given I have an account
    And I am logged in

  Scenario: Add a new expense
    Given I am on the expenses page
    When I add an expense of $25.50 for "Lunch"
    Then the expense appears in my list
    And my total spending increases by $25.50

  Scenario: Add expense with invalid amount
    Given I am on the expenses page
    When I try to add an expense of -$10
    Then I see an error "Amount must be positive"
    And no expense is created
```
