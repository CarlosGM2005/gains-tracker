import { type Routes } from '@angular/router';

import { navData } from '@core/layout/route-data';

// authGuard está en app.routes.ts, sobre `perfil`.
export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    title: 'Perfil',
    data: navData('mobile-only'),
    loadComponent: () => import('./pages/perfil-page').then((m) => m.PerfilPage),
  },
  {
    path: 'editar',
    title: 'Editar datos',
    data: navData('mobile-only'),
    loadComponent: () => import('./pages/editar-perfil-page').then((m) => m.EditarPerfilPage),
  },
];
