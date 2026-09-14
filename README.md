# GainsTracker

App web de gimnasio: catálogo de ejercicios por músculo y nivel, ejercicios recomendados y registro
personal de series. Versión 2 en reconstrucción (rama `rebuild`).

## Stack

- Angular 21 (standalone, zoneless, signals) + Angular CDK
- SCSS con tokens de diseño (`src/styles/_tokens.scss`), sin Bootstrap
- Datos detrás de repositorios: **mock** en memoria (activo) y Firebase 12 (Auth + Firestore + Analytics, listo sin activar)
- Vitest para tests unitarios, ESLint + Prettier + Stylelint

## Puesta en marcha

Requiere Node `^22.22.2` o `>=24.15.0`.

```bash
npm install
npm start          # http://localhost:4200
npm test           # Vitest
npm run lint       # ESLint (TS + plantillas)
npm run lint:styles
npm run format:check
```

Con `dataSource: 'mock'` (por defecto) no hace falta Firebase. Usuario de demostración:
`demo@gainstracker.dev` / `demo1234`.

## Firebase

1. Pega la config web del proyecto en `src/environments/environment*.ts` (`firebase`) y pon
   `dataSource: 'firebase'`.
2. En desarrollo (`useEmulators: true`) arranca los emuladores con Firebase CLI:
   `firebase emulators:start --only auth,firestore` (UI en http://127.0.0.1:4000).
3. Reglas en `firestore.rules`. Se despliegan a mano: `firebase deploy --only firestore:rules`.

## Estructura

```
src/app/
  core/       singletons: auth, firebase, analytics, errors, notifications, layout, routing
  shared/     UI y utilidades sin dominio
  features/   ejercicios, registros, perfil, auth, inicio, legal
              cada una con domain/, data/ (contrato + mock/ + firebase/), pages/, ui/, state/
  app.data.ts único sitio donde se elige mock o Firebase
```

Reglas de dependencia (las comprueba ESLint):

- Una feature solo importa el `domain/` o el `public-api.ts` de otra; dentro de la misma feature, rutas relativas.
- `shared/` no importa de `core/` ni de `features/`.
- `firebase/*` solo en `core/firebase` y `features/*/data/firebase`.

## Rutas

`/`, `/inicio`, `/ejercicios`, `/ejercicios/:nivel?musculo=`, `/ejercicios/detalle/:id`,
`/recomendados?musculo=`, `/registros`, `/perfil`, `/perfil/editar`, `/privacidad`, `/login`,
`/registro`. Las URL antiguas `/main/...` redirigen a las nuevas (`src/app/app.legacy-routes.ts`).

## Despliegue

Netlify. `public/_redirects` sirve `index.html` en cualquier ruta.
