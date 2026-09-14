import { type Environment } from './environment.model';

/** Entorno de los tests unitarios: siempre datos mock y sin latencia, nunca Firebase. */
export const TEST_ENVIRONMENT: Environment = {
  production: false,
  dataSource: 'mock',
  firebase: null,
  useEmulators: false,
  mockLatencyMs: 0,
};
