# Frontend — Angular

## Stack
- **Angular** (latest stable)
- **TypeScript**
- **RxJS** para manejo de reactividad
- **Angular Material** o librería de componentes UI (por definir)

## Estructura de carpetas

```
src/
├── app/
│   ├── core/                  # Servicios singleton, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── models/
│   ├── shared/                # Componentes, pipes y directives reutilizables
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── features/              # Módulos por dominio/negocio
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── ...
│   └── layouts/               # Layouts de la aplicación
├── assets/
├── environments/
└── styles/
```

## Convenciones

- **Componentes**: standalone components (Angular 17+), no `@NgModule` a menos que sea legacy
- **Servicios**: `@Injectable({ providedIn: 'root' })`
- **Nombres**: kebab-case para archivos (`user-list.component.ts`), PascalCase para clases
- **Signals** para estado local, **RxJS** para flujos asíncronos y comunicación entre componentes
- **HTTP**: `HttpClient` con interceptors para auth y error handling centralizado
- **Estilos**: preferir CSS/SCSS nativo de Angular o Tailwind si se decide usar

## Commits

- Convención [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `refactor:` cambio de código sin cambiar comportamiento
  - `style:` formato, puntos y comas, etc.
  - `docs:` documentación
  - `test:` tests
  - `chore:` tareas de build, deps, config
