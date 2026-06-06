# Latte Factor

Monorepo con frontend y backend separados.

## Estructura

```
├── frontend/          # Angular
│   └── AGENTS.md      # Guía de estructura y convenciones
├── backend/           # Go — DDD Hexagonal Architecture
│   └── AGENTS.md      # Guía de estructura y convenciones
└── README.md
```

## Tecnologías

| Capa       | Tecnología                              |
|------------|-----------------------------------------|
| Frontend   | Angular + TypeScript + RxJS             |
| Backend    | Go — Arquitectura DDD Hexagonal         |
| Database   | PostgreSQL                              |

## Convenciones de commits

Ambas carpetas siguen [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `refactor:` cambio sin cambiar comportamiento
- `docs:` documentación
- `test:` tests
- `chore:` tareas de build/config

## Guías detalladas

- [Frontend](frontend/AGENTS.md) — Angular
- [Backend](backend/AGENTS.md) — Go DDD Hexagonal
