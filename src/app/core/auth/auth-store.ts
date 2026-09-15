import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom, type Observable } from 'rxjs';

import { AuthRepository } from './auth-repository';
import { AuthError, type AuthUser } from './auth.model';

/** Estado de la sesión en signals. Las pantallas y guards leen de aquí, nunca del repositorio. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly repo = inject(AuthRepository);

  /** `undefined` mientras se resuelve la sesión inicial. */
  readonly usuario = toSignal(this.repo.usuario$, { initialValue: undefined });
  readonly listo = computed(() => this.usuario() !== undefined);
  readonly sesion = computed(() => this.usuario() ?? null);
  readonly autenticado = computed(() => !!this.usuario());

  /** Emite una sola vez, cuando la sesión inicial ya está resuelta. */
  sesionResuelta(): Promise<AuthUser | null> {
    const resuelto$ = this.repo.usuario$.pipe(
      filter((u): u is AuthUser | null => u !== undefined),
    ) as Observable<AuthUser | null>;
    return firstValueFrom(resuelto$);
  }

  /** Uid del usuario actual o error `sin-sesion`. */
  uidActual(): string {
    const usuario = this.sesion();
    if (!usuario) {
      throw new AuthError('sin-sesion');
    }
    return usuario.uid;
  }

  loginConEmail(email: string, password: string): Promise<AuthUser> {
    return this.repo.loginConEmail(email.trim(), password);
  }

  loginConGoogle(): Promise<AuthUser> {
    return this.repo.loginConGoogle();
  }

  registrar(email: string, password: string, nombre: string): Promise<AuthUser> {
    return this.repo.registrar(email.trim(), password, nombre.trim());
  }

  logout(): Promise<void> {
    return this.repo.logout();
  }

  solicitarCambioEmail(nuevoEmail: string): Promise<void> {
    return this.repo.solicitarCambioEmail(nuevoEmail.trim());
  }

  reautenticar(password: string): Promise<void> {
    return this.repo.reautenticar(password);
  }

  reautenticarConGoogle(): Promise<void> {
    return this.repo.reautenticarConGoogle();
  }

  eliminarCuenta(): Promise<void> {
    return this.repo.eliminarCuenta();
  }
}
