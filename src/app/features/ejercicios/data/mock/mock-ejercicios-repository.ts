import { inject, Injectable } from '@angular/core';

import { esperar, MOCK_LATENCY_MS } from '@core/data/mock-latency';

import { type Ejercicio, type Musculo, type Nivel } from '../../domain/ejercicio.model';
import { EjerciciosRepository } from '../ejercicios-repository';
import { EJERCICIOS_MOCK } from './ejercicios.mock-data';

@Injectable()
export class MockEjerciciosRepository extends EjerciciosRepository {
  private readonly latencia = inject(MOCK_LATENCY_MS);

  todos(): Promise<Ejercicio[]> {
    return this.filtrar(() => true);
  }

  porNivelYMusculo(nivel: Nivel, musculo: Musculo): Promise<Ejercicio[]> {
    return this.filtrar((e) => e.nivel === nivel && e.musculo === musculo);
  }

  recomendados(): Promise<Ejercicio[]> {
    return this.filtrar((e) => e.recomendado);
  }

  recomendadosPorMusculo(musculo: Musculo): Promise<Ejercicio[]> {
    return this.filtrar((e) => e.recomendado && e.musculo === musculo);
  }

  async porId(id: string): Promise<Ejercicio | null> {
    const [ejercicio] = await this.filtrar((e) => e.id === id);
    return ejercicio ?? null;
  }

  async porNombre(nombre: string): Promise<Ejercicio | null> {
    const [ejercicio] = await this.filtrar((e) => e.nombre === nombre);
    return ejercicio ?? null;
  }

  private async filtrar(condicion: (e: Ejercicio) => boolean): Promise<Ejercicio[]> {
    await esperar(this.latencia);
    return EJERCICIOS_MOCK.filter(condicion).map((e) => ({ ...e }));
  }
}
