import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AuthStore } from './auth-store';

/** Ruta por defecto tras iniciar sesión o si se entra al login con sesión abierta. */
export const RUTA_TRAS_LOGIN = '/inicio';

/**
 * Solo con sesión. Espera a que Firebase resuelva la sesión inicial (así no expulsa al recargar)
 * y, sin sesión, lleva al login recordando la URL pedida.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const usuario = await inject(AuthStore).sesionResuelta();
  return usuario ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Solo sin sesión (login y registro). Con sesión, al inicio. */
export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const usuario = await inject(AuthStore).sesionResuelta();
  return usuario ? router.createUrlTree([RUTA_TRAS_LOGIN]) : true;
};

/** Evita redirecciones abiertas: solo se aceptan rutas internas. */
export function destinoSeguro(returnUrl: string | null | undefined): string {
  return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : RUTA_TRAS_LOGIN;
}
