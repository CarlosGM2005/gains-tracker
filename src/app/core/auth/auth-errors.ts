import { AuthError, type AuthErrorCode } from './auth.model';

const MENSAJES: Readonly<Record<AuthErrorCode, string>> = {
  'credenciales-invalidas': 'Correo o contraseña incorrectos.',
  'email-en-uso': 'Ya existe una cuenta con ese correo electrónico.',
  'password-debil': 'La contraseña no es lo bastante segura.',
  'popup-cerrado': 'Has cerrado la ventana de Google antes de terminar.',
  'popup-bloqueado': 'El navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes.',
  'requiere-login-reciente': 'Por seguridad, vuelve a introducir tu contraseña.',
  'cuenta-distinta': 'Has elegido una cuenta distinta a la de tu sesión.',
  'sin-sesion': 'Debes iniciar sesión para continuar.',
  red: 'No hay conexión. Comprueba tu red e inténtalo de nuevo.',
  desconocido: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
};

/** Mensaje para el usuario a partir de cualquier error (los que no son `AuthError` usan el genérico). */
export function mensajeDeErrorAuth(error: unknown): string {
  return error instanceof AuthError ? MENSAJES[error.code] : MENSAJES.desconocido;
}

export function esErrorAuth(error: unknown, code: AuthErrorCode): boolean {
  return error instanceof AuthError && error.code === code;
}
