/**
 * Impide ampliar la app con los dedos. Con zoom, Safari volvía a rasterizar las capas del fondo a
 * la nueva escala, agotaba la memoria y cerraba la página ("Se ha producido un problema
 * repetidamente"). Decisión del usuario: sin zoom en toda la app.
 *
 * Tres capas, porque cada navegador hace caso a una distinta:
 * - `maximum-scale=1, user-scalable=no` en el viewport de `index.html`: Chrome y Android.
 * - `touch-action: pan-x pan-y` en `html` (`_reset.scss`): pellizco y doble toque donde se soporta.
 * - Aquí, cancelar los eventos `gesture*`, que solo existen en Safari: es lo único que Safari de
 *   iOS respeta, porque ignora `user-scalable=no` desde iOS 10.
 */
export function bloquearZoom(documento: Document): void {
  const cancelar = (evento: Event): void => evento.preventDefault();
  for (const tipo of ['gesturestart', 'gesturechange', 'gestureend']) {
    documento.addEventListener(tipo, cancelar, { passive: false });
  }
}
