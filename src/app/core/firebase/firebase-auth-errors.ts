import { AuthError, type AuthErrorCode } from '../auth/auth.model';

const CODIGOS: Readonly<Record<string, AuthErrorCode>> = {
  'auth/invalid-credential': 'credenciales-invalidas',
  'auth/invalid-login-credentials': 'credenciales-invalidas',
  'auth/wrong-password': 'credenciales-invalidas',
  'auth/user-not-found': 'credenciales-invalidas',
  'auth/invalid-email': 'credenciales-invalidas',
  'auth/email-already-in-use': 'email-en-uso',
  'auth/weak-password': 'password-debil',
  'auth/popup-closed-by-user': 'popup-cerrado',
  'auth/cancelled-popup-request': 'popup-cerrado',
  'auth/popup-blocked': 'popup-bloqueado',
  'auth/requires-recent-login': 'requiere-login-reciente',
  'auth/network-request-failed': 'red',
};

/** Convierte un error de Firebase Auth (`{ code: 'auth/...' }`) en `AuthError` de dominio. */
export function aAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }
  const codigo =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';
  return new AuthError(CODIGOS[codigo] ?? 'desconocido', codigo || 'desconocido');
}
