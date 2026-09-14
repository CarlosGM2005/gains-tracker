import { type Routes } from '@angular/router';

import { legacyDetalleGuard } from '@features/ejercicios/legacy-detalle.guard';

/**
 * Redirecciones desde las URL de la app antigua (`/main/...`) para no romper enlaces guardados.
 * Se pueden eliminar cuando ya no lleguen visitas a esas URL.
 */
export const LEGACY_ROUTES: Routes = [
  {
    path: 'main',
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/inicio' },
      { path: 'level-exercice', redirectTo: '/ejercicios' },
      { path: 'exercices/:level', redirectTo: '/ejercicios/:level' },
      // Necesita consultar el ejercicio por nombre, así que no basta con redirectTo.
      { path: 'info-exercice/:nombre', canActivate: [legacyDetalleGuard], children: [] },
      { path: 'recomendations', redirectTo: '/recomendados' },
      { path: 'records', redirectTo: '/registros' },
      { path: 'basic-profile', redirectTo: '/perfil' },
      { path: 'data-profile', redirectTo: '/perfil/editar' },
      { path: 'privacy-policy', redirectTo: '/privacidad' },
      { path: 'login', redirectTo: '/login' },
      { path: 'register', redirectTo: '/registro' },
      { path: '**', redirectTo: '/inicio' },
    ],
  },
];
