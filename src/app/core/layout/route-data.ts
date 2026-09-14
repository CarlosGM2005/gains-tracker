import { type ActivatedRouteSnapshot, type Data } from '@angular/router';

/**
 * Qué navegación muestra el shell en cada ruta.
 * - `full`: barra lateral en escritorio e inferior en móvil.
 * - `mobile-only`: solo la barra inferior (en escritorio se oculta, como hoy en perfil).
 * - `none`: sin navegación (portada, login, registro).
 */
export type NavMode = 'full' | 'mobile-only' | 'none';

export const NAV_MODE_POR_DEFECTO: NavMode = 'full';

export function navData(nav: NavMode): Data {
  return { nav };
}

/** Lee `nav` de la ruta activa más profunda que lo declare. */
export function navModeDe(snapshot: ActivatedRouteSnapshot): NavMode {
  let actual: ActivatedRouteSnapshot | null = snapshot;
  let modo: NavMode = NAV_MODE_POR_DEFECTO;
  while (actual) {
    const valor: unknown = actual.data['nav'];
    if (valor === 'full' || valor === 'mobile-only' || valor === 'none') {
      modo = valor;
    }
    actual = actual.firstChild;
  }
  return modo;
}
