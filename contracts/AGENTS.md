# Contracts Context

This directory contains API contracts organized by domain following DDD structure.

## Structure

```
contracts/
└── <domain>/
    ├── openapi.yaml          # API contract for this domain
    └── examples/             # Request/response examples
```

## Conventions

- Domain names in `kebab-case`
- One contract per domain
- Complete HTTP status code documentation
- Reusable schemas in `components/schemas`
- Concrete examples for each operation

## Workflow

For Spec-Driven Development, use the SDD workflow:

```bash
/sdd <feature-name>
```

This will create contracts in `features/<name>/contracts/` following the same structure.
