import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter, map, of, startWith, switchMap } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';

import { PerfilRepository } from '../data/perfil-repository';
import { type CambiosPerfil, type Perfil } from '../domain/perfil.model';

type EstadoPerfil = { tipo: 'cargando' } | { tipo: 'listo'; perfil: Perfil | null } | { tipo: 'error' };

/**
 * Perfil del usuario actual en tiempo real: al guardar, el cambio llega solo por la escucha.
 * Si el email de Auth cambia (tras confirmar la verificación), lo copia al perfil.
 */
@Injectable({ providedIn: 'root' })
export class PerfilStore {
  private readonly auth = inject(AuthStore);
  private readonly repo = inject(PerfilRepository);

  private readonly estado = toSignal(
    toObservable(this.auth.usuario).pipe(
      switchMap((usuario) => {
        if (usuario === undefined) {
          return of<EstadoPerfil>({ tipo: 'cargando' });
        }
        if (usuario === null) {
          return of<EstadoPerfil>({ tipo: 'listo', perfil: null });
        }
        return this.repo.observar(usuario.uid).pipe(
          map((perfil): EstadoPerfil => ({ tipo: 'listo', perfil })),
          startWith<EstadoPerfil>({ tipo: 'cargando' }),
          catchError(() => of<EstadoPerfil>({ tipo: 'error' })),
        );
      }),
    ),
    { initialValue: { tipo: 'cargando' } as EstadoPerfil },
  );

  readonly cargando = computed(() => this.estado().tipo === 'cargando');
  readonly error = computed(() => this.estado().tipo === 'error');
  readonly perfil = computed(() => {
    const estado = this.estado();
    return estado.tipo === 'listo' ? estado.perfil : null;
  });
  /** Los usuarios de Google cambian el email en su cuenta de Google, no aquí. */
  readonly puedeCambiarEmail = computed(() => this.auth.sesion()?.proveedor === 'password');

  constructor() {
    combineLatest([toObservable(this.auth.sesion), toObservable(this.perfil)])
      .pipe(
        filter(([usuario, perfil]) => !!usuario && !!perfil && usuario.email !== perfil.email),
        takeUntilDestroyed(),
      )
      .subscribe(([usuario]) => {
        if (usuario) {
          void this.repo.sincronizarEmail(usuario.uid, usuario.email);
        }
      });
  }

  actualizar(cambios: CambiosPerfil): Promise<void> {
    return this.repo.actualizar(this.auth.uidActual(), cambios);
  }

  /** Guarda una foto ya comprimida o la quita (`null`). */
  cambiarFoto(foto: string | null): Promise<void> {
    return this.repo.actualizar(this.auth.uidActual(), { foto });
  }
}
