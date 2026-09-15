import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';

import { FavoritosRepository } from '../data/favoritos-repository';

type EstadoFavoritos = { tipo: 'cargando' } | { tipo: 'listo'; ids: readonly string[] } | { tipo: 'error' };

/** Favoritos del usuario actual en tiempo real. Sin sesión, la lista está vacía. */
@Injectable({ providedIn: 'root' })
export class FavoritosStore {
  private readonly auth = inject(AuthStore);
  private readonly repo = inject(FavoritosRepository);

  private readonly estado = toSignal(
    toObservable(this.auth.usuario).pipe(
      switchMap((usuario) => {
        if (usuario === undefined) {
          return of<EstadoFavoritos>({ tipo: 'cargando' });
        }
        if (usuario === null) {
          return of<EstadoFavoritos>({ tipo: 'listo', ids: [] });
        }
        return this.repo.observar(usuario.uid).pipe(
          map((ids): EstadoFavoritos => ({ tipo: 'listo', ids })),
          startWith<EstadoFavoritos>({ tipo: 'cargando' }),
          catchError(() => of<EstadoFavoritos>({ tipo: 'error' })),
        );
      }),
    ),
    { initialValue: { tipo: 'cargando' } as EstadoFavoritos },
  );

  readonly cargando = computed(() => this.estado().tipo === 'cargando');
  readonly error = computed(() => this.estado().tipo === 'error');
  /** Ids en el orden en que se marcaron (el último, al final). */
  readonly ids = computed<readonly string[]>(() => {
    const estado = this.estado();
    return estado.tipo === 'listo' ? estado.ids : [];
  });
  private readonly conjunto = computed(() => new Set(this.ids()));

  esFavorito(ejercicioId: string): boolean {
    return this.conjunto().has(ejercicioId);
  }

  /** Marca o desmarca. Resuelve el nuevo estado (`true` = ahora es favorito). */
  async alternar(ejercicioId: string): Promise<boolean> {
    const favorito = !this.esFavorito(ejercicioId);
    await this.repo.marcar(this.auth.uidActual(), ejercicioId, favorito);
    return favorito;
  }
}
