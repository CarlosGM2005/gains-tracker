import { type Observable } from 'rxjs';

import { type AuthUser } from './auth.model';

/**
 * Contrato de autenticación. Las implementaciones lanzan `AuthError` con códigos de dominio.
 * Implementaciones: `mock/` ahora; `core/firebase/` cuando el proyecto Firebase esté activo.
 */
export abstract class AuthRepository {
  /** Emite `undefined` mientras se resuelve la sesión inicial y después el usuario o `null`. */
  abstract readonly usuario$: Observable<AuthUser | null | undefined>;

  abstract loginConEmail(email: string, password: string): Promise<AuthUser>;

  abstract loginConGoogle(): Promise<AuthUser>;

  abstract registrar(email: string, password: string, nombre: string): Promise<AuthUser>;

  abstract logout(): Promise<void>;

  /** Envía un email de verificación al nuevo correo; el cambio se aplica cuando el usuario lo confirma. */
  abstract solicitarCambioEmail(nuevoEmail: string): Promise<void>;

  /** Necesario antes de operaciones sensibles si la sesión es antigua (`requiere-login-reciente`). */
  abstract reautenticar(password: string): Promise<void>;

  /** Igual que `reautenticar`, para usuarios de Google (vuelve a pedir la cuenta en una ventana). */
  abstract reautenticarConGoogle(): Promise<void>;

  /** Borra el usuario de Auth y cierra la sesión. Exige una autenticación reciente. */
  abstract eliminarCuenta(): Promise<void>;
}
