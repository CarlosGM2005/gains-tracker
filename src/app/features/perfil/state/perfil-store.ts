import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter, map, of, startWith, switchMap } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';
import { diaLocal } from '@shared/utils/fechas';

import { PerfilRepository } from '../data/perfil-repository';
import { PesoCorporalRepository } from '../data/peso-corporal-repository';
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
  private readonly pesos = inject(PesoCorporalRepository);

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

  async actualizar(cambios: CambiosPerfil): Promise<void> {
    const uid = this.auth.uidActual();
    await this.repo.actualizar(uid, cambios);
    // Un peso nuevo en "Datos perfil" también se apunta en el historial de peso corporal. Si eso
    // falla, el perfil ya está guardado: no se da el cambio por fallido.
    if (typeof cambios.peso === 'number') {
      await this.pesos
        .guardar(uid, { dia: diaLocal(new Date()), kg: cambios.peso })
        .catch((e: unknown) => console.error('No se pudo apuntar el peso en el historial', e));
    }
  }

  /** Guarda una foto ya comprimida o la quita (`null`). */
  cambiarFoto(foto: string | null): Promise<void> {
    return this.repo.actualizar(this.auth.uidActual(), { foto });
  }
}
