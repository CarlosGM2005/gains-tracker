import { type EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, type Firestore, getFirestore } from 'firebase/firestore';

import { type FirebaseWebConfig } from '@env/environment.model';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');

/** Puertos por defecto de `firebase emulators:start` (ver firebase.json). */
export const EMULADORES = {
  auth: 'http://127.0.0.1:9099',
  firestore: { host: '127.0.0.1', port: 8080 },
} as const;

/**
 * Inicializa Firebase de forma perezosa (solo cuando algo inyecta los tokens).
 * Con `useEmulators` se conecta a los emuladores locales y nunca a producción.
 * Con `usarProxyAuth` el login pasa por nuestro dominio en lugar de `*.firebaseapp.com`.
 */
export function provideFirebase(
  config: FirebaseWebConfig,
  useEmulators: boolean,
  usarProxyAuth = false,
): EnvironmentProviders {
  const configuracion = conAuthDomainPropio(config, usarProxyAuth);
  return makeEnvironmentProviders([
    { provide: FIREBASE_APP, useFactory: () => initializeApp(configuracion) },
    {
      provide: FIREBASE_AUTH,
      useFactory: () => {
        const auth = getAuth(inject(FIREBASE_APP));
        auth.languageCode = 'es';
        if (useEmulators) {
          connectAuthEmulator(auth, EMULADORES.auth, { disableWarnings: true });
        }
        return auth;
      },
    },
    {
      provide: FIRESTORE,
      useFactory: () => {
        const db = getFirestore(inject(FIREBASE_APP));
        if (useEmulators) {
          connectFirestoreEmulator(db, EMULADORES.firestore.host, EMULADORES.firestore.port);
        }
        return db;
      },
    },
  ]);
}

/**
 * Apunta `authDomain` al dominio que sirve la app. Netlify reenvía `/__/auth/*` al proyecto de
 * Firebase (ver `netlify.toml`), así que el iframe de inicio de sesión deja de ser de terceros
 * y Safari ya no bloquea su almacenamiento. Sin eso, `signInWithRedirect` nunca termina.
 *
 * Sirve para cualquier dominio de Netlify, incluidas las previsualizaciones de rama.
 */
function conAuthDomainPropio(config: FirebaseWebConfig, usarProxyAuth: boolean): FirebaseWebConfig {
  if (!usarProxyAuth || typeof location === 'undefined') return config;
  return { ...config, authDomain: location.hostname };
}
