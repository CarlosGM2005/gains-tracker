export type ProveedorAuth = 'password' | 'google';

export interface AuthUser {
  uid: string;
  email: string;
  nombre: string | null;
  proveedor: ProveedorAuth;
  emailVerificado: boolean;
}

/** Errores de autenticación ya traducidos al dominio (independientes de Firebase). */
export type AuthErrorCode =
  | 'credenciales-invalidas'
  | 'email-en-uso'
  | 'password-debil'
  | 'popup-cerrado'
  | 'popup-bloqueado'
  | 'requiere-login-reciente'
  | 'cuenta-distinta'
  | 'sin-sesion'
  | 'red'
  | 'desconocido';

export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string = code,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
