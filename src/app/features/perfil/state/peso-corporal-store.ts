import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';
import { diaLocal } from '@shared/utils/fechas';

import { PerfilRepository } from '../data/perfil-repository';
import { PesoCorporalRepository } from '../data/peso-corporal-repository';
import { type RegistroPeso, resumenPeso } from '../domain/peso-corporal.model';

type EstadoPesos = { tipo: 'cargando' } | { tipo: 'listo'; pesos: RegistroPeso[] } | { tipo: 'error' };

/** Historial de peso corporal del usuario actual, en tiempo real. */
@Injectable({ providedIn: 'root' })
export class PesoCorporalStore {
  private readonly auth = inject(AuthStore);
  private readonly repo = inject(PesoCorporalRepository);
  private readonly perfiles = inject(PerfilRepository);

  private readonly estado = toSignal(
    toObservable(this.auth.usuario).pipe(
      switchMap((usuario) => {
        if (usuario === undefined) {
          return of<EstadoPesos>({ tipo: 'cargando' });
        }
        if (usuario === null) {
          return of<EstadoPesos>({ tipo: 'listo', pesos: [] });
        }
        return this.repo.observar(usuario.uid).pipe(
          map((pesos): EstadoPesos => ({ tipo: 'listo', pesos })),
          startWith<EstadoPesos>({ tipo: 'cargando' }),
          catchError(() => of<EstadoPesos>({ tipo: 'error' })),
        );
      }),
    ),
    { initialValue: { tipo: 'cargando' } as EstadoPesos },
  );

  readonly cargando = computed(() => this.estado().tipo === 'cargando');
  readonly error = computed(() => this.estado().tipo === 'error');
  /** Del día más antiguo al más reciente. */
  readonly pesos = computed<readonly RegistroPeso[]>(() => {
    const estado = this.estado();
    return estado.tipo === 'listo' ? estado.pesos : [];
  });
  readonly resumen = computed(() => resumenPeso(this.pesos()));

  /**
   * Guarda el peso de un día (hoy, si no se indica). Si es el registro más reciente, pasa a ser
   * también el peso del perfil, que es el que se ve en "Datos perfil".
   */
  async registrar(kg: number, dia = diaLocal(new Date())): Promise<void> {
    const uid = this.auth.uidActual();
    await this.repo.guardar(uid, { dia, kg });
    const ultimo = this.pesos().at(-1);
    if (!ultimo || dia >= ultimo.dia) {
      await this.perfiles.actualizar(uid, { peso: kg });
    }
  }
}
