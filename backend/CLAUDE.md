# Backend — Go (DDD Hexagonal Architecture)

> Memoria de Claude Code para el backend. Se carga automáticamente al trabajar
> en `backend/`. Es la **fuente de verdad** de stack y convenciones para los
> agentes SDD (`developer`, `qa-engineer`, `reviewer`).

## Stack
- **Go** (última estable)
- **[chi](https://github.com/go-chi/chi)** como router HTTP — 100% compatible con
  `net/http`, ligero, con grupos de rutas y middleware. (Descartado Fiber: usa
  `fasthttp`, incompatible con el ecosistema `net/http` y con oapi-codegen.)
- **PostgreSQL** como base de datos principal
- **sqlx** o **GORM** para queries (por definir)
- **Testify** para unit tests · **godog** para aceptación (Gherkin ejecutable)

## Estructura de carpetas (Hexagonal / DDD)

```
cmd/
└── server/
    └── main.go              # Entry point: monta el router chi + DI
internal/
├── domain/                  # Capa de dominio (núcleo, sin dependencias externas)
│   ├── model/               # Entidades y value objects (+ *_test.go al lado)
│   ├── repository/          # Interfaces de repositorios (ports)
│   ├── service/             # Casos de uso / servicios de dominio
│   └── error/               # Errores específicos del dominio
├── infrastructure/          # Capa de infraestructura (adapters)
│   ├── persistence/         # Implementaciones de repositorios (DB)
│   ├── external/            # Servicios externos (APIs, colas, etc.)
│   └── config/              # Configuración (env, flags, archivos)
├── application/             # Capa de aplicación (orquestación)
│   └── dto/                 # Data Transfer Objects
└── interfaces/              # Capa de interfaces externas
    ├── http/                # Handlers + router chi
    └── middleware/          # Middlewares (auth, logging, etc.)
pkg/                         # Código reutilizable y público
scripts/                     # Scripts de utilidad (migrations, etc.)
test/
└── acceptance/              # Step definitions godog (ejecutan specs/*/backend/*.feature)
go.mod  go.sum  Makefile  .golangci.yml
```

## Capa HTTP (chi)

El handler es **fino**: parsea la petición, llama al caso de uso y mapea el
resultado a la respuesta. Nada de lógica de negocio aquí.

```go
r := chi.NewRouter()
r.Use(middleware.Logger, middleware.Recoverer)
r.Route("/api/v1", func(r chi.Router) {
    r.Post("/expenses", h.CreateExpense)        // h delega en el use case
    r.Get("/expenses/{id}", h.GetExpense)        // chi.URLParam(req, "id")
})
```

## Codegen del contrato (oapi-codegen)

El servidor chi **se genera** desde `specs/<feature>/contract/openapi.yaml`, no se
escribe a mano. `make generate` produce, por cada contrato:

- Carpeta `internal/interfaces/http/<pkg>/api.gen.go` (`<pkg>` = nombre de la
  feature sin guiones; p. ej. `expense-tracking` → paquete `expensetracking`).
- **Tipos** de request/response · **`StrictServerInterface`** (handlers tipados)
  · **`HandlerFromMux`** (montaje en chi) · **cliente** tipado (para godog).

Reglas:
- El `developer` **implementa `StrictServerInterface`**; si el contrato cambia y
  la implementación no lo cumple, **no compila** (conformidad en compile-time).
- **Nunca** editar a mano los `*.gen.go` (`DO NOT EDIT`). Cambiar el contrato →
  `make generate` → commit. `make verify` falla si el generado está desfasado
  (drift check) o sin commitear.
- Config compartida en `oapi-codegen.yaml`; oapi-codegen va pineado como *tool*
  en `go.mod` (`go tool oapi-codegen`).
- Contratos en **OpenAPI 3.0.3** (oapi-codegen no soporta 3.1 del todo).

## Testing

- **Unit (Testify):** co-localizados con el código — `internal/domain/model/expense_test.go`
  junto a `expense.go`. Obligatorio: los paquetes `internal/` solo se importan
  desde dentro de `backend/`.
- **Aceptación (godog):** los `.feature` de `specs/<feature>/backend/` se ejecutan
  directamente; las step definitions viven en `test/acceptance/`. El Gherkin ES
  el test, no se transcribe a mano.

## Quality gate (`make verify`)

| Target | Qué hace |
|--------|----------|
| `make verify` | codegen drift + gofmt + `go vet` + golangci-lint + unit + godog + cobertura |
| `make generate` | genera servidor chi + cliente desde cada contrato |
| `make acceptance` | solo los tests godog |
| `make contract-lint` | Spectral sobre `specs/*/contract/openapi.yaml` |
| `make install-tools` | instala golangci-lint en `$(go env GOPATH)/bin` |

Una feature está **terminada** cuando `make verify` está en verde.

## Principios

- **Dominio independiente**: `internal/domain` no depende de ninguna otra capa.
- **Puertos e implementaciones**: los repositorios se definen como interfaces en
  `domain/repository` y se implementan en `infrastructure/persistence`.
- **Inyección de dependencias**: los servicios reciben sus dependencias
  (interfaces) por constructor — sin singletons globales.
- **DTOs**: la capa de aplicación mapea entre entidades del dominio y DTOs.
- **Handlers finos**: `interfaces/http` solo orquesta el caso de uso y responde.

## Convenciones

- **Nombres**: `kebab-case` para archivos, `PascalCase` para tipos exportados,
  `camelCase` para variables.
- **Dinero**: SIEMPRE enteros en céntimos (o `decimal`), **nunca `float64`**.
- **Errores**: `fmt.Errorf("...: %w", err)` para wrapping; errores de dominio en
  `domain/error`.
- **Config**: variables de entorno o `.env` (viper / dotenv).
- **Logging**: estructurado con `slog`.
- **Migrations**: `golang-migrate` o similar.

## Commits — [Conventional Commits](https://www.conventionalcommits.org/)

`feat:` · `fix:` · `refactor:` · `style:` · `docs:` · `test:` · `chore:`
Un commit por cambio lógico; nunca mezclar feature + fix.
