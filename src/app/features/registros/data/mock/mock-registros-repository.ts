import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, type Observable } from 'rxjs';

import { DEMO_USER } from '@core/auth/mock/demo-user';
import { esperar, MOCK_LATENCY_MS } from '@core/data/mock-latency';

import {
  type EjercicioRegistrable,
  type NuevaSerie,
  type RegistroEjercicio,
  type Serie,
} from '../../domain/registro.model';
import { RegistrosRepository } from '../registros-repository';

type RegistrosPorUsuario = ReadonlyMap<string, readonly RegistroEjercicio[]>;

const REGISTROS_DEMO: readonly RegistroEjercicio[] = [
  {
    ejercicioId: 'ej-press-de-banca',
    nombre: 'Press de banca',
    imagen: 'ejercicios/placeholder-final.svg',
    series: [
      // Serie antigua: sin id propio ni fecha de creación, como las guarda la app actual.
      { id: 'legacy-0', dia: '2025-06-02', series: 4, repeticiones: 10, peso: 60, descansoMin: 2, creadaEn: null },
      { id: 's-2', dia: '2025-06-09', series: 4, repeticiones: 8, peso: 65, descansoMin: 2, creadaEn: new Date('2025-06-09T18:30:00Z') },
    ],
  },
  {
    ejercicioId: 'ej-sentadilla',
    nombre: 'Sentadilla',
    imagen: 'ejercicios/placeholder-final.svg',
    series: [
      { id: 's-3', dia: '2025-06-10', series: 5, repeticiones: 5, peso: 90, descansoMin: 3, creadaEn: new Date('2025-06-10T19:00:00Z') },
    ],
  },
];

@Injectable()
export class MockRegistrosRepository extends RegistrosRepository {
  private readonly latencia = inject(MOCK_LATENCY_MS);
  private readonly registros = new BehaviorSubject<RegistrosPorUsuario>(new Map([[DEMO_USER.uid, REGISTROS_DEMO]]));

  observar(uid: string): Observable<RegistroEjercicio[]> {
    return this.registros.pipe(
      map((todos) => (todos.get(uid) ?? []).map((r) => ({ ...r, series: r.series.map((s) => ({ ...s })) }))),
    );
  }

  async agregarSerie(uid: string, ejercicio: EjercicioRegistrable, nueva: NuevaSerie): Promise<void> {
    await esperar(this.latencia);
    const serie: Serie = { ...nueva, id: crypto.randomUUID(), creadaEn: new Date() };
    const actuales = this.registros.value.get(uid) ?? [];
    const existente = actuales.find((r) => r.ejercicioId === ejercicio.id);

    const siguientes: RegistroEjercicio[] = existente
      ? actuales.map((r) => (r === existente ? { ...r, series: [...r.series, serie] } : r))
      : [
          ...actuales,
          { ejercicioId: ejercicio.id, nombre: ejercicio.nombre, imagen: ejercicio.imagenFinal, series: [serie] },
        ];

    const mapa = new Map(this.registros.value);
    mapa.set(uid, siguientes);
    this.registros.next(mapa);
  }
}
