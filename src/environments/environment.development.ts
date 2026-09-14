import { type Environment } from './environment.model';

/**
 * Desarrollo (`npm start`). Misma config web que producción (valores DE EJEMPLO: sustitúyelos).
 *
 * `useEmulators`:
 * - `false` (actual): `npm start` lee y escribe en el Firestore REAL. Lo que registres en local queda
 *   en producción.
 * - `true`: usa los emuladores locales. Requiere Firebase CLI (`npm i -g firebase-tools`), Java y
 *   `firebase emulators:start --only auth,firestore` en otra terminal.
 *
 * Para trabajar sin Firebase (datos de ejemplo en memoria), pon `dataSource: 'mock'`.
 */
export const environment: Environment = {
  production: false,
  dataSource: 'firebase',
  firebase: {
    apiKey: 'AIzaSyBN8GGpXi4fUV5iZ4fWskI2DM2c49LzfPM',
    authDomain: 'gainstracker-21592.firebaseapp.com',
    projectId: 'gainstracker-21592',
    storageBucket: 'gainstracker-21592.firebasestorage.app',
    messagingSenderId: '825525128907',
    appId: '1:825525128907:web:65f2ae1ed99973340e954e',
    measurementId: 'G-JZX067XBJC',
  },
  useEmulators: false,
  mockLatencyMs: 300,
};
