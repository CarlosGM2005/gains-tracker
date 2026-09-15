import { type Routes } from '@angular/router';

import { authGuard, guestGuard } from '@core/auth/auth.guards';
import { navData } from '@core/layout/route-data';
import { Shell } from '@core/layout/shell/shell';

import { LEGACY_ROUTES } from './app.legacy-routes';

export const routes: Routes = [
  ...LEGACY_ROUTES,
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: navData('none'),
        loadComponent: () => import('@features/inicio/pages/bienvenida-page').then((m) => m.BienvenidaPage),
      },
      {
        path: 'inicio',
        title: 'Inicio',
        loadComponent: () => import('@features/inicio/pages/inicio-page').then((m) => m.InicioPage),
      },
      {
        path: 'ejercicios',
        loadChildren: () => import('@features/ejercicios/ejercicios.routes').then((m) => m.EJERCICIOS_ROUTES),
      },
      {
        // Fuera de /ejercicios: así la entrada "Ejercicios" de la barra no se marca a la vez que "Buscar".
        path: 'buscar',
        title: 'Buscar ejercicios',
        loadComponent: () => import('@features/ejercicios/pages/buscar-page').then((m) => m.BuscarPage),
      },
      {
        path: 'recomendados',
        title: 'Recomendados',
        loadComponent: () =>
          import('@features/ejercicios/pages/recomendados-page').then((m) => m.RecomendadosPage),
      },
      {
        path: 'registros',
        title: 'Mis registros',
        canActivate: [authGuard],
        loadComponent: () => import('@features/registros/pages/registros-page').then((m) => m.RegistrosPage),
      },
      {
        path: 'estadisticas',
        title: 'Estadísticas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@features/registros/pages/estadisticas-page').then((m) => m.EstadisticasPage),
      },
      {
        path: 'favoritos',
        title: 'Favoritos',
        canActivate: [authGuard],
        loadComponent: () => import('@features/favoritos/pages/favoritos-page').then((m) => m.FavoritosPage),
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadChildren: () => import('@features/perfil/perfil.routes').then((m) => m.PERFIL_ROUTES),
      },
      {
        path: 'privacidad',
        title: 'Política de privacidad',
        loadComponent: () => import('@features/legal/privacidad-page').then((m) => m.PrivacidadPage),
      },
      {
        path: 'login',
        title: 'Iniciar sesión',
        canActivate: [guestGuard],
        data: navData('none'),
        loadComponent: () => import('@features/auth/pages/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'registro',
        title: 'Registro',
        canActivate: [guestGuard],
        data: navData('none'),
        loadComponent: () => import('@features/auth/pages/registro-page').then((m) => m.RegistroPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
