import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { esNivel } from './domain/ejercicio.model';

/**
 * Deja pasar `/ejercicios/:nivel` solo con un nivel válido.
 * - `Avanzado` (mayúsculas) redirige a `avanzado` conservando el query string.
 * - Un nivel desconocido redirige a la elección de nivel.
 */
export const nivelValidoGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const nivel = route.paramMap.get('nivel') ?? '';
  const normalizado = nivel.toLowerCase();

  if (!esNivel(normalizado)) {
    return router.createUrlTree(['/ejercicios']);
  }
  if (normalizado !== nivel) {
    return router.createUrlTree(['/ejercicios', normalizado], { queryParams: route.queryParams });
  }
  return true;
};
