import { inject, Injectable } from '@angular/core';

import { type AnalyticsTracker } from '../analytics/analytics.service';
import { FIREBASE_APP } from './firebase.providers';

type EnviarVista = (ruta: string, titulo: string) => void;

/**
 * Firebase Analytics. El SDK va en un trozo aparte que se descarga cuando el navegador queda libre
 * tras arrancar: así no pesa en la carga inicial. Solo se activa si el navegador lo soporta
 * (bloqueadores, modo privado...). Las vistas que llegan antes se envían en cuanto está listo.
 */
@Injectable()
export class FirebaseAnalyticsTracker implements AnalyticsTracker {
  private readonly app = inject(FIREBASE_APP);
  private readonly enviar: Promise<EnviarVista | null> = cuandoEsteLibre()
    .then(() => import('firebase/analytics'))
    .then(async ({ getAnalytics, isSupported, logEvent }) => {
      if (!(await isSupported())) {
        return null;
      }
      const analytics = getAnalytics(this.app);
      return (ruta: string, titulo: string) =>
        logEvent(analytics, 'page_view', { page_path: ruta, page_title: titulo });
    })
    .catch(() => null);

  paginaVista(ruta: string, titulo: string): void {
    void this.enviar.then((enviar) => enviar?.(ruta, titulo));
  }
}

/** Espera a que el navegador quede libre. Safari no tiene `requestIdleCallback`: allí, un retardo. */
function cuandoEsteLibre(): Promise<void> {
  return new Promise((resolver) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolver(), { timeout: 5000 });
    } else {
      setTimeout(resolver, 3000);
    }
  });
}
