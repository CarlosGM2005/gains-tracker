import { DOCUMENT, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import {
  type ApplicationConfig,
  ErrorHandler,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';

import { provideServiceWorker } from '@angular/service-worker';

import { AnalyticsService } from '@core/analytics/analytics.service';
import { GlobalErrorHandler } from '@core/errors/global-error-handler';
import { ActualizacionService } from '@core/pwa/actualizacion.service';
import { bloquearZoom } from '@core/pwa/bloquear-zoom';
import { AppTitleStrategy } from '@core/routing/app-title-strategy';
import { omitirTransicionEnMismaRuta } from '@core/routing/view-transitions';
import { environment } from '@env/environment';
import { SesionService } from '@features/auth/state/sesion.service';

import { provideDataLayer } from './app.data';
import { routes } from './app.routes';

// Fechas y números en español (DatePipe, DecimalPipe).
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true, onViewTransitionCreated: omitirTransicionEnMismaRuta }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      // Tras la primera pantalla se descargan en segundo plano el resto de páginas: al navegar ya
      // están listas y no hay espera de red entre pulsar y ver la página nueva.
      withPreloading(PreloadAllModules),
    ),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideDataLayer(environment),
    // El service worker solo se registra en producción: en `ng serve` estorbaría al recargar.
    // Se espera a que la app esté estable para no competir con la primera carga.
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideAppInitializer(() => inject(AnalyticsService).iniciar()),
    provideAppInitializer(() => inject(ActualizacionService).iniciar()),
    provideAppInitializer(() => inject(SesionService).iniciar()),
    provideAppInitializer(() => bloquearZoom(inject(DOCUMENT))),
  ],
};
