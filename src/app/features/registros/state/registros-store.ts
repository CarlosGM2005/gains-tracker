import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';

import { RegistrosRepository } from '../data/registros-repository';
import {
  type EjercicioRegistrable,
  type NuevaSerie,
  type RegistroEjercicio,
  ultimoDia,
} from '../domain/registro.model';

type EstadoRegistros =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; registros: RegistroEjercicio[] }
  | { tipo: 'error' };

/**
 * Registros del usuario en tiempo real. La escucha se abre y se cierra sola al entrar o salir de
 * la sesión, así que no quedan datos de otro usuario.
 */
@Injectable({ providedIn: 'root' })
export class RegistrosStore {
  private readonly auth = inject(AuthStore);
  private readonly repo = inject(RegistrosRepository);

  private readonly estado = toSignal(
    toObservable(this.auth.usuario).pipe(
      switchMap((usuario) => {
        if (usuario === undefined) {
          return of<EstadoRegistros>({ tipo: 'cargando' });
        }
        if (usuario === null) {
          return of<EstadoRegistros>({ tipo: 'listo', registros: [] });
        }
        return this.repo.observar(usuario.uid).pipe(
          map((registros): EstadoRegistros => ({ tipo: 'listo', registros })),
          startWith<EstadoRegistros>({ tipo: 'cargando' }),
          catchError(() => of<EstadoRegistros>({ tipo: 'error' })),
        );
      }),
    ),
    { initialValue: { tipo: 'cargando' } as EstadoRegistros },
  );

  readonly cargando = computed(() => this.estado().tipo === 'cargando');
  readonly error = computed(() => this.estado().tipo === 'error');

  /**
   * Ordenados por el día más reciente registrado; dentro de cada uno, series de más nueva a más antigua.
   * Un registro sin series (documento vaciado a mano) no se muestra.
   */
  readonly registros = computed<RegistroEjercicio[]>(() => {
    const estado = this.estado();
    if (estado.tipo !== 'listo') {
      return [];
    }
    return estado.registros
      .filter((r) => r.series.length > 0)
      .map((r) => ({ ...r, series: [...r.series].sort((a, b) => b.dia.localeCompare(a.dia)) }))
      .sort((a, b) => (ultimoDia(b) ?? '').localeCompare(ultimoDia(a) ?? ''));
  });

  agregarSerie(ejercicio: EjercicioRegistrable, serie: NuevaSerie): Promise<void> {
    return this.repo.agregarSerie(this.auth.uidActual(), ejercicio, serie);
  }

  actualizarSerie(ejercicioId: string, serieId: string, cambios: NuevaSerie): Promise<void> {
    return this.repo.actualizarSerie(this.auth.uidActual(), ejercicioId, serieId, cambios);
  }

  borrarSerie(ejercicioId: string, serieId: string): Promise<void> {
    return this.repo.borrarSerie(this.auth.uidActual(), ejercicioId, serieId);
  }
}
