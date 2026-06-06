# Contracts

Definicion de contratos de endpoints agrupados por dominio.

## Estructura

Cada dominio debe tener su propia carpeta dentro de `contracts/`:

```
contracts/
└── <dominio>/
    ├── openapi.yaml          # Contrato HTTP del dominio
    └── examples/             # Payloads de request/response
```

## Convenciones

- Usar nombres de dominio en `kebab-case`, por ejemplo `user-profile` o `subscription`.
- Mantener un contrato por dominio para evitar acoplar areas funcionales distintas.
- Documentar requests, responses, codigos HTTP y errores relevantes.
- Guardar ejemplos reutilizables bajo `examples/` cuando ayuden a validar integraciones.
