import { registerLocaleData } from '@angular/common';
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
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';

import { AnalyticsService } from '@core/analytics/analytics.service';
import { GlobalErrorHandler } from '@core/errors/global-error-handler';
import { AppTitleStrategy } from '@core/routing/app-title-strategy';
import { omitirTransicionEnMismaRuta } from '@core/routing/view-transitions';
import { environment } from '@env/environment';

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
    ),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideDataLayer(environment),
    provideAppInitializer(() => inject(AnalyticsService).iniciar()),
  ],
};
