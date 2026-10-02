/** Origen de los datos de la app. `mock` funciona sin Firebase, con datos en memoria. */
export type DataSource = 'mock' | 'firebase';

/** Config web de Firebase (no es secreta; la protección real son las reglas). */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface Environment {
  production: boolean;
  dataSource: DataSource;
  /** Solo se usa con `dataSource: 'firebase'`. */
  firebase: FirebaseWebConfig | null;
  /** Con `dataSource: 'firebase'`, conecta a los emuladores locales en lugar de producción. */
  useEmulators: boolean;
  /**
   * Sirve los ayudantes de login de Firebase desde nuestro propio dominio, a través del proxy
   * `/__/auth/*` de Netlify (ver `netlify.toml` y `public/_redirects`).
   *
   * Hace falta porque Safari bloquea el almacenamiento de terceros: sin esto
   * `signInWithRedirect` no termina nunca, y la redirección es el único flujo que funciona
   * con la app instalada en iOS. Solo se activa donde exista el proxy, nunca en local.
   */
  usarProxyAuth: boolean;
  /** Retardo artificial de los repositorios mock, para ver estados de carga. */
  mockLatencyMs: number;
}
