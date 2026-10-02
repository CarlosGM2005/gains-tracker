/**
 * Detección del entorno para la instalación de la PWA.
 *
 * Reglas que vienen de limitaciones reales del sistema:
 * - En iOS solo Safari puede añadir a la pantalla de inicio. Chrome, Firefox y los navegadores
 *   incrustados de Instagram, Facebook o Gmail no pueden: hay que mandar al usuario a Safari.
 * - En iOS no existe `beforeinstallprompt`, así que no hay botón nativo: se explica el gesto.
 */

export type Plataforma = 'ios-safari' | 'ios-otro-navegador' | 'android-o-escritorio';

/** iPadOS 13+ miente y dice "Macintosh": se distingue por el soporte táctil. */
export function esIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

/** Safari de verdad: ni otro navegador de iOS ni un navegador incrustado en otra app. */
export function esSafariIOS(): boolean {
  if (!esIOS()) return false;
  const ua = navigator.userAgent;
  const otroNavegador = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo/.test(ua);
  const incrustado = /FBAN|FBAV|Instagram|Line\/|Twitter|MicroMessenger|GSA\//.test(ua);
  return /Safari/.test(ua) && !otroNavegador && !incrustado;
}

/** La app ya se abre instalada (pantalla de inicio en iOS o ventana propia en el resto). */
export function enModoApp(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

export function plataformaActual(): Plataforma {
  if (!esIOS()) return 'android-o-escritorio';
  return esSafariIOS() ? 'ios-safari' : 'ios-otro-navegador';
}
