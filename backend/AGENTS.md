# Backend — Go (DDD Hexagonal Architecture)

## Stack
- **Go** (latest stable)
- **Gin** o **Fiber** como framework HTTP (por definir)
- **PostgreSQL** como base de datos principal
- **GORM** o **sqlx** para ORM / queries (por definir)
- **Testify** para tests

## Estructura de carpetas (Hexagonal / DDD)

```
cmd/
└── server/
    └── main.go              # Entry point de la aplicación
internal/
├── domain/                  # Capa de dominio (núcleo)
│   ├── model/               # Entidades y value objects
│   ├── repository/          # Interfaces de repositorios (ports)
│   ├── service/             # Casos de uso / servicios de dominio
│   └── error/               # Errores específicos del dominio
├── infrastructure/          # Capa de infraestructura
│   ├── persistence/         # Implementaciones de repositorios (DB)
│   ├── external/            # Servicios externos (APIs, colas, etc.)
│   └── config/              # Configuración (env, flags, archivos)
├── application/             # Capa de aplicación (orquestación)
│   └── dto/                 # Data Transfer Objects
└── interfaces/              # Capa de interfaces externas
    ├── http/                # Handlers / routes HTTP
    ├── middleware/          # Middlewares (auth, logging, etc.)
    └── grpc/                # (opcional) handlers gRPC
pkg/                         # Código reutilizable y público
scripts/                     # Scripts de utilidad (migrations, etc.)
tests/                       # Tests integration / e2e
go.mod
go.sum
Makefile
```

## Principios

- **Dominio independiente**: `internal/domain` no depende de ninguna otra capa
- **Puertos e implementaciones**: los repositorios se definen como interfaces en `domain/repository` y se implementan en `infrastructure/persistence`
- **Inyección de dependencias**: los servicios reciben sus dependencias (interfaces) por constructor
- **DTOs**: la capa de aplicación mapea entre entidades del dominio y DTOs para las APIs
- **Handlers**: la capa `interfaces/http` solo orquesta la llamada al caso de uso y devuelve la respuesta HTTP

## Convenciones

- **Nombres**: `kebab-case` para archivos, `PascalCase` para tipos, `camelCase` para variables
- **Errores**: usar `fmt.Errorf` con `%w` para wrapping, errores definidos en `domain/error`
- **Config**: leer desde variables de entorno o archivo `.env` (viper / dotenv)
- **Logging**:结构化 con `slog` o `zap`
- **Migrations**: `golang-migrate` o similar

## Commits

- Convención [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `refactor:` cambio de código sin cambiar comportamiento
  - `style:` formato, linting
  - `docs:` documentación
  - `test:` tests
  - `chore:` tareas de build, deps, config
