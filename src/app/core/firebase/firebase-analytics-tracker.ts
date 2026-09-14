import { inject, Injectable } from '@angular/core';
import { type Analytics, getAnalytics, isSupported, logEvent } from 'firebase/analytics';

import { type AnalyticsTracker } from '../analytics/analytics.service';
import { FIREBASE_APP } from './firebase.providers';

/**
 * Firebase Analytics. Se carga solo si el navegador lo soporta (bloqueadores, modo privado...).
 * Las vistas que llegan antes de que esté listo se envían en cuanto lo está.
 */
@Injectable()
export class FirebaseAnalyticsTracker implements AnalyticsTracker {
  private readonly app = inject(FIREBASE_APP);
  private readonly analytics: Promise<Analytics | null> = isSupported()
    .then((ok) => (ok ? getAnalytics(this.app) : null))
    .catch(() => null);

  paginaVista(ruta: string, titulo: string): void {
    void this.analytics.then((analytics) => {
      if (analytics) {
        logEvent(analytics, 'page_view', { page_path: ruta, page_title: titulo });
      }
    });
  }
}
