import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ANALYTICS_TRACKER } from '@core/analytics/analytics.service';
import { AuthRepository } from '@core/auth/auth-repository';
import { MockAuthRepository } from '@core/auth/mock/mock-auth-repository';
import { MOCK_LATENCY_MS } from '@core/data/mock-latency';
import { FirebaseAnalyticsTracker } from '@core/firebase/firebase-analytics-tracker';
import { FirebaseAuthRepository } from '@core/firebase/firebase-auth-repository';
import { provideFirebase } from '@core/firebase/firebase.providers';
import { EjerciciosRepository } from '@features/ejercicios/data/ejercicios-repository';
import { FirebaseEjerciciosRepository } from '@features/ejercicios/data/firebase/firebase-ejercicios-repository';
import { MockEjerciciosRepository } from '@features/ejercicios/data/mock/mock-ejercicios-repository';
import { FirebasePerfilRepository } from '@features/perfil/data/firebase/firebase-perfil-repository';
import { MockPerfilRepository } from '@features/perfil/data/mock/mock-perfil-repository';
import { PerfilRepository } from '@features/perfil/data/perfil-repository';
import { FirebaseRegistrosRepository } from '@features/registros/data/firebase/firebase-registros-repository';
import { MockRegistrosRepository } from '@features/registros/data/mock/mock-registros-repository';
import { RegistrosRepository } from '@features/registros/data/registros-repository';
import { type Environment } from '@env/environment.model';

/**
 * Único punto donde se elige la implementación de cada repositorio.
 * El resto de la app solo conoce los contratos (clases abstractas).
 */
export function provideDataLayer(env: Environment): EnvironmentProviders {
  if (env.dataSource === 'firebase') {
    if (!env.firebase) {
      throw new Error('dataSource es "firebase" pero environment.firebase está vacío. Pega la config web del proyecto.');
    }
    return makeEnvironmentProviders([
      provideFirebase(env.firebase, env.useEmulators),
      { provide: ANALYTICS_TRACKER, useClass: FirebaseAnalyticsTracker },
      { provide: AuthRepository, useClass: FirebaseAuthRepository },
      { provide: EjerciciosRepository, useClass: FirebaseEjerciciosRepository },
      { provide: PerfilRepository, useClass: FirebasePerfilRepository },
      { provide: RegistrosRepository, useClass: FirebaseRegistrosRepository },
    ]);
  }

  return makeEnvironmentProviders([
    { provide: MOCK_LATENCY_MS, useValue: env.mockLatencyMs },
    { provide: AuthRepository, useClass: MockAuthRepository },
    { provide: EjerciciosRepository, useClass: MockEjerciciosRepository },
    { provide: PerfilRepository, useClass: MockPerfilRepository },
    { provide: RegistrosRepository, useClass: MockRegistrosRepository },
  ]);
}
