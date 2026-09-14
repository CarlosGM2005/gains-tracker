import { type ActivatedRouteSnapshot, type ViewTransitionInfo } from '@angular/router';

function rutaFinal(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  let actual = snapshot;
  while (actual.firstChild) {
    actual = actual.firstChild;
  }
  return actual;
}

/**
 * Sin animación cuando la navegación se queda en la misma ruta y solo cambian parámetros
 * (p. ej. el chip de músculo cambia `?musculo=`): animar toda la página ahí distrae.
 */
export function omitirTransicionEnMismaRuta({ transition, from, to }: ViewTransitionInfo): void {
  if (rutaFinal(from).routeConfig === rutaFinal(to).routeConfig) {
    transition.skipTransition();
  }
}
