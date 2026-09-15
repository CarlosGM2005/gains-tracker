# AGENTS.md — gains-tracker

Reglas que cualquier agente de IA debe respetar en este repositorio.

## Antes de empezar

- El repo tiene dos versiones: **`rebuild`** (v2, Angular 21, donde se trabaja) y **`master`**
  (v1 original, Angular 18, se conserva intacta). Comprueba la rama con `git branch --show-current`
  y lee `CLAUDE.md`.

## Reglas de agente

- **NUNCA ejecutes builds, tests ni arranques de la aplicación**: nada de `ng build`,
  `ng serve`, `ng test`, `npm start`, `npm run build`, `npm test`, `npm run lint` ni Playwright.
  Para verificar un cambio, describe qué comprobar y qué comando lanzar, y deja que lo ejecute el
  usuario. `npm install` también se pide antes de ejecutarlo.
- **NUNCA toques la base de datos real.** Aquí la base es Firestore del proyecto Firebase
  `gainstracker-21592`: no ejecutes `firebase deploy`, `firebase firestore:*` ni código o
  scripts que lean o escriban datos reales. En la v2 `npm start` ya apunta al Firestore real, otro
  motivo para no arrancarla. Los cambios de reglas (`firestore.rules`, `storage.rules`) o de
  estructura de colecciones se entregan en el archivo o como nota, junto con cómo deshacerlos, y
  los aplica el usuario.
- No hagas `git commit` ni `git push` salvo petición expresa. Nunca sobre `master` sin que el
  usuario lo pida. No versiones `CLAUDE.md`, `AGENTS.md` ni `.cbmignore`.
- `node_modules/`, `dist/`, `.angular/` y `coverage/` no son fuente: no los leas ni los edites.
- La configuración web de Firebase está en `src/environments/environment*.ts` (v2) y en
  `src/app/app.config.ts` (v1, rama `master`). No la copies a otros sitios ni la envíes a
  servicios externos.
