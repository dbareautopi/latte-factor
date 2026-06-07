---
name: review-code
description: Step-by-step workflow for reviewing code quality with soft gate approach.
---

# How to Review Code

## Step 1: Read Source Documents

Read:
- `features/<name>/contracts/openapi.yaml`
- `features/<name>/specs/behavior.feature`
- `features/<name>/tests/`
- Implementation code

## Step 2: Review Dimensions

### Critical Issues (BLOCK)

These MUST be fixed:

| Category | Check |
|----------|-------|
| Security | No hardcoded secrets, SQL injection, XSS |
| Data Loss | No unintended data deletion/corruption |
| Contract Violation | Response doesn't match OpenAPI schema |
| Error Handling | Unhandled exceptions, missing error responses |
| Race Conditions | Concurrent access issues |

### Important Issues (WARN)

Should be fixed, but don't block:

| Category | Check |
|----------|-------|
| Test Coverage | Missing edge cases |
| Performance | Obvious inefficiencies |
| Code Duplication | Repeated logic |
| Naming | Unclear variable/function names |

### Suggestions (INFO)

Nice to have:

| Category | Check |
|----------|-------|
| Refactoring | Could be simplified |
| Documentation | Missing/unclear docs |
| Style | Minor formatting issues |

## Step 3: Generate Report

```markdown
## Code Review Report

### Summary
- **Status**: ✅ Approved / ⚠️ Approved with suggestions / ❌ Changes requested
- **Critical Issues**: X
- **Warnings**: X
- **Suggestions**: X

### Critical Issues (MUST FIX)
1. **[Security]** `path/to/file.ts:42`
   > Description
   > 
   > Fix: How to fix

### Warnings (should fix)
1. **[Performance]** `path/to/file.ts:28`
   > Description
   > 
   > Suggestion: How to improve

### Suggestions (optional)
1. **[Style]** `path/to/file.ts:15`
   > Minor improvement
```

## Step 4: Make Decision

```
IF critical_issues > 0:
  status = "Changes requested"
  action = "Send to developer"
  
ELSE IF warnings > 3:
  status = "Approved with suggestions"
  action = "Note suggestions, approve"
  
ELSE:
  status = "Approved"
  action = "Proceed to completion"
```

## Review Philosophy

> "Perfect is the enemy of good."

- **Be pragmatic**: Minor issues can be addressed later
- **Be constructive**: Suggest solutions, not just problems
- **Be specific**: Point to exact lines
- **Be kind**: Code review is about code, not people
