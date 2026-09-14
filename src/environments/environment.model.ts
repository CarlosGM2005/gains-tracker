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
  /** Retardo artificial de los repositorios mock, para ver estados de carga. */
  mockLatencyMs: number;
}
