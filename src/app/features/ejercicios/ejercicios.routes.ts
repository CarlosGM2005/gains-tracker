import { type Routes } from '@angular/router';

import { nivelValidoGuard } from './nivel-valido.guard';

export const EJERCICIOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Ejercicios',
    loadComponent: () => import('./pages/nivel-page').then((m) => m.NivelPage),
  },
  {
    path: 'detalle/:id',
    title: 'Ejercicio',
    loadComponent: () => import('./pages/detalle-page').then((m) => m.DetallePage),
  },
  {
    path: ':nivel',
    title: 'Ejercicios',
    canActivate: [nivelValidoGuard],
    loadComponent: () => import('./pages/catalogo-page').then((m) => m.CatalogoPage),
  },
];
