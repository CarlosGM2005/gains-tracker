# CLAUDE.md — gains-tracker (app de gimnasio: Angular + Firebase)

Hereda el contexto global (`~/.claude/CLAUDE.md`): regla de idioma dual, regla de la wiki,
regla del índice de código (MCP codebase-memory, proyecto `gains-tracker`), regla de context7
y las dos reglas duras (no builds/tests/arranques, no tocar base de datos).

## Dos versiones en el mismo repo: mira la rama antes de nada

Ejecuta `git branch --show-current` al empezar. Las dos ramas no se parecen en nada.

| Rama | Qué es | Estado |
|---|---|---|
| `rebuild` | **v2, reconstrucción desde cero** (septiembre 2026). Aquí se trabaja salvo que el usuario diga lo contrario | Paridad funcional completa, conectada a Firebase |
| `master` | **v1 original** (TFG 2025): Angular 18 + Bootstrap + `@angular/fire`. Se conserva intacta como referencia | No se modifica sin petición expresa |

La especificación funcional que ambas cumplen está en la wiki (`funcionalidades.md`). Para ver
cómo lo hacía la v1 sin cambiar de rama: `git show master:<ruta>`.

## Reglas de la v2 (rama `rebuild`)

- **Angular 21**, standalone, **zoneless**, signals, `OnPush` obligatorio, control flow `@if/@for`,
  `inject()`, `input()/output()/model()`. Archivos sin sufijo `.component` (`login-page.ts`,
  clase `LoginPage`). Reactive Forms tipados (`NonNullableFormBuilder`).
- **Estructura** (`src/app`): `core/` (auth, firebase, analytics, errors, notifications, layout,
  routing), `shared/` (UI y utilidades sin dominio), `features/<feature>/` con `domain/`,
  `data/` (contrato + `mock/` + `firebase/`), `state/`, `pages/`, `ui/` y `public-api.ts`.
- **Límites** (los vigila `eslint.config.js`): una feature solo importa de otra su `domain/` o su
  `public-api.ts`; `shared/` no importa `core/` ni `features/`; `firebase/*` solo en
  `core/firebase` y `features/*/data/firebase`.
- **Datos**: SDK `firebase` 12 directo, sin AngularFire. Las pantallas nunca llaman a Firebase: usan
  stores (`AuthStore`, `CatalogoStore`, `RegistrosStore`, `PerfilStore`, `FavoritosStore`) que usan repositorios
  abstractos. `src/app/app.data.ts` elige `mock` o `firebase` según `environment.dataSource`.
  Los mappers de `data/firebase/` mantienen los nombres de campo antiguos de Firestore
  (`imgFinal`, `numero`, `descanso`, `createdAt`). La foto de perfil va en `usuarios/{uid}.foto` (data URL
  comprimido, sin Storage) y los favoritos en `usuarios/{uid}.favoritos`.
- **Entornos**: `environment.development.ts` (usado por `npm start`) apunta al **Firestore real**
  con `useEmulators: false`. Los tests usan `environment.testing.ts` (siempre mock). No cambies
  un entorno a producción ni a emuladores sin pedirlo.
- **UI**: sin Bootstrap. Tokens en `src/styles/_tokens.scss` (único sitio con colores hex),
  breakpoints con `@use 'breakpoints' as bp` y `bp.up(lg)`, clases globales `.btn`, `.form`,
  `.field`, `.input`, `.page`. Fuente display `Oswald Variable` (fontsource). Diálogos con CDK
  Dialog. Avisos con `ToastService`, nunca `alert()`.
- **Idioma del código**: dominio en español (`Ejercicio`, `Serie`, `nivel`, `registros`),
  términos técnicos en inglés (`page`, `store`, `repository`), URL en español.
- **Reutiliza** antes de crear: componentes de `shared/ui` (`PageHeader`, `ChipGroup`,
  `EmptyState`, `Spinner`, `Carousel`, `ConfirmService` para confirmar acciones...), `FieldError` y
  `refrescarConFormulario` para formularios.
- **Tests**: Vitest (`*.spec.ts` junto al archivo). Los e2e los hace el usuario; no los escribas.

## Reglas comunes a las dos ramas

- **La base de datos es Firestore de producción** (proyecto `gainstracker-21592`). Nunca ejecutes
  `firebase deploy`, scripts que lean o escriban en Firestore ni la app. Los cambios de
  `firestore.rules` / `storage.rules` se entregan en el archivo y los publica el usuario.
- git: commit y push solo si el usuario lo pide, y **nunca sobre `master`** salvo petición expresa.
  `CLAUDE.md`, `AGENTS.md` y `.cbmignore` no están versionados a propósito: así existen en las dos
  ramas. No los añadas a un commit.

## Wiki

Notas en `C:\Users\kkarlitos05\Desktop\Proyectos\gains-tracker\` (empieza por `README.md`).
Para la v2: `reconstruccion/estado-actual.md` (punto de entrada), `reconstruccion/arquitectura.md` y
`reconstruccion/plan-fases.md`. Lo común a varios proyectos, en `comun\`.
