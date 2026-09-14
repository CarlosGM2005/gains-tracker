import { type AuthUser } from '../auth.model';

/** Usuario de demostración de los repositorios mock. Credenciales: demo@gainstracker.dev / demo1234 */
export const DEMO_PASSWORD = 'demo1234';

export const DEMO_USER: AuthUser = {
  uid: 'demo-uid',
  email: 'demo@gainstracker.dev',
  nombre: 'Demo',
  proveedor: 'password',
  emailVerificado: true,
};

/** Usuario que devuelve el login con Google simulado (sin perfil creado de antemano). */
export const DEMO_GOOGLE_USER: AuthUser = {
  uid: 'demo-google-uid',
  email: 'demo.google@gainstracker.dev',
  nombre: 'Demo Google',
  proveedor: 'google',
  emailVerificado: true,
};
