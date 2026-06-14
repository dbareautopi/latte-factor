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
test/
└── acceptance/              # Step definitions godog (ejecutan specs/*/backend/*.feature)
go.mod
go.sum
Makefile
.golangci.yml
```

## Testing

- **Unit (Testify):** co-localizados con el código — `internal/domain/model/expense_test.go`
  junto a `expense.go`. Obligatorio: los paquetes `internal/` solo se importan
  desde dentro de `backend/`.
- **Aceptación (godog):** los `.feature` de `specs/<feature>/backend/` se ejecutan
  directamente; las step definitions viven en `test/acceptance/`. El Gherkin ES
  el test, no se transcribe a mano.
- **Dinero:** siempre enteros en céntimos (o decimal), nunca `float64`.

## Quality gate (`make verify`)

| Target | Qué hace |
|--------|----------|
| `make verify` | gofmt + `go vet` + golangci-lint + unit + godog + cobertura |
| `make acceptance` | solo los tests godog |
| `make contract-lint` | Spectral sobre `specs/*/contract/openapi.yaml` |
| `make install-tools` | instala golangci-lint en `$(go env GOPATH)/bin` |

Una feature está **terminada** cuando `make verify` está en verde.

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
