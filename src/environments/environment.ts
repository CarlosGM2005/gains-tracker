import { type Environment } from './environment.model';

/**
 * Producción (`ng build`). Conecta con el proyecto Firebase real `gainstracker-21592`.
 *
 * IMPORTANTE: los valores de `firebase` son DE EJEMPLO: sustitúyelos por la config web real
 * (consola de Firebase → Configuración del proyecto → General → Tus apps → SDK de Firebase → Config).
 * No es un secreto, pero la protección real son las reglas de Firestore y restringir la API key
 * a tus dominios en Google Cloud Console.
 */
export const environment: Environment = {
  production: true,
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
  mockLatencyMs: 0,
};
