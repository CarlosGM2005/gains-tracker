import { DestroyRef, inject, Injectable, InjectionToken } from '@angular/core';
import { NavigationEnd, Router, TitleStrategy } from '@angular/router';
import { filter } from 'rxjs';

/** Destino de los eventos de analítica. Con datos mock no hace nada. */
export interface AnalyticsTracker {
  paginaVista(ruta: string, titulo: string): void;
}

export const ANALYTICS_TRACKER = new InjectionToken<AnalyticsTracker>('ANALYTICS_TRACKER', {
  providedIn: 'root',
  factory: () => ({ paginaVista: () => undefined }),
});

/**
 * Registra una vista de página por navegación (RF-18). Sustituye a `ScreenTrackingService`
 * de AngularFire. Se arranca una vez desde `app.config.ts`.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly titulos = inject(TitleStrategy);
  private readonly tracker = inject(ANALYTICS_TRACKER);
  private readonly destroyRef = inject(DestroyRef);
  private iniciado = false;

  iniciar(): void {
    if (this.iniciado) {
      return;
    }
    this.iniciado = true;
    const suscripcion = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const titulo = this.titulos.buildTitle(this.router.routerState.snapshot) ?? 'GainsTracker';
        this.tracker.paginaVista(e.urlAfterRedirects, titulo);
      });
    this.destroyRef.onDestroy(() => suscripcion.unsubscribe());
  }
}
