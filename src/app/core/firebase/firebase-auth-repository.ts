import { inject, Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { BehaviorSubject, type Observable } from 'rxjs';

import { AuthRepository } from '../auth/auth-repository';
import { AuthError, type AuthUser } from '../auth/auth.model';
import { aAuthError } from './firebase-auth-errors';
import { FIREBASE_AUTH } from './firebase.providers';

function aAuthUser(user: User): AuthUser {
  const google = user.providerData.some((p) => p.providerId === GoogleAuthProvider.PROVIDER_ID);
  return {
    uid: user.uid,
    email: user.email ?? '',
    nombre: user.displayName,
    proveedor: google ? 'google' : 'password',
    emailVerificado: user.emailVerified,
  };
}

/**
 * Autenticación con Firebase Auth.
 * - Google: popup; si el navegador lo bloquea, redirección (se recoge al volver, una sola vez).
 * - El cambio de email usa `verifyBeforeUpdateEmail`: se aplica cuando el usuario confirma el enlace.
 */
@Injectable()
export class FirebaseAuthRepository extends AuthRepository {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly usuario = new BehaviorSubject<AuthUser | null | undefined>(undefined);

  readonly usuario$: Observable<AuthUser | null | undefined> = this.usuario.asObservable();

  constructor() {
    super();
    onAuthStateChanged(this.auth, (user) => this.usuario.next(user ? aAuthUser(user) : null));
    // Resultado de un login con Google por redirección (si lo hubo). El usuario llega por onAuthStateChanged.
    getRedirectResult(this.auth).catch((e: unknown) => console.error('Login con Google por redirección', e));
  }

  loginConEmail(email: string, password: string): Promise<AuthUser> {
    return this.ejecutar(async () => aAuthUser((await signInWithEmailAndPassword(this.auth, email, password)).user));
  }

  async loginConGoogle(): Promise<AuthUser> {
    const proveedor = new GoogleAuthProvider();
    try {
      return aAuthUser((await signInWithPopup(this.auth, proveedor)).user);
    } catch (e) {
      const error = aAuthError(e);
      if (error.code === 'popup-bloqueado') {
        // La página se va a Google; al volver, onAuthStateChanged recibe el usuario.
        await signInWithRedirect(this.auth, proveedor);
      }
      throw error;
    }
  }

  registrar(email: string, password: string, nombre: string): Promise<AuthUser> {
    return this.ejecutar(async () => {
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(user, { displayName: nombre });
      return aAuthUser(user);
    });
  }

  logout(): Promise<void> {
    return this.ejecutar(() => signOut(this.auth));
  }

  solicitarCambioEmail(nuevoEmail: string): Promise<void> {
    return this.ejecutar(() => verifyBeforeUpdateEmail(this.usuarioActual(), nuevoEmail));
  }

  reautenticar(password: string): Promise<void> {
    return this.ejecutar(async () => {
      const user = this.usuarioActual();
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? '', password));
    });
  }

  private usuarioActual(): User {
    const user = this.auth.currentUser;
    if (!user) {
      throw new AuthError('sin-sesion');
    }
    return user;
  }

  private async ejecutar<T>(accion: () => Promise<T>): Promise<T> {
    try {
      return await accion();
    } catch (e) {
      throw aAuthError(e);
    }
  }
}
