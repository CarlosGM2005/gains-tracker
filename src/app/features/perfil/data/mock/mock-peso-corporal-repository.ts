import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, type Observable } from 'rxjs';

import { DEMO_USER } from '@core/auth/mock/demo-user';
import { esperar, MOCK_LATENCY_MS } from '@core/data/mock-latency';

import { type RegistroPeso } from '../../domain/peso-corporal.model';
import { PesoCorporalRepository } from '../peso-corporal-repository';

const PESOS_DEMO: readonly RegistroPeso[] = [
  { dia: '2025-05-01', kg: 77.5 },
  { dia: '2025-05-15', kg: 76.8 },
  { dia: '2025-06-01', kg: 76.1 },
  { dia: '2025-06-15', kg: 75 },
];

@Injectable()
export class MockPesoCorporalRepository extends PesoCorporalRepository {
  private readonly latencia = inject(MOCK_LATENCY_MS);
  private readonly pesos = new BehaviorSubject<ReadonlyMap<string, readonly RegistroPeso[]>>(
    new Map([[DEMO_USER.uid, PESOS_DEMO]]),
  );

  observar(uid: string): Observable<RegistroPeso[]> {
    return this.pesos.pipe(map((todos) => (todos.get(uid) ?? []).map((p) => ({ ...p }))));
  }

  async guardar(uid: string, registro: RegistroPeso): Promise<void> {
    await esperar(this.latencia);
    const resto = (this.pesos.value.get(uid) ?? []).filter((p) => p.dia !== registro.dia);
    this.fijar(
      uid,
      [...resto, { ...registro }].sort((a, b) => a.dia.localeCompare(b.dia)),
    );
  }

  async borrarTodos(uid: string): Promise<void> {
    await esperar(this.latencia);
    this.fijar(uid, []);
  }

  private fijar(uid: string, pesos: readonly RegistroPeso[]): void {
    const siguiente = new Map(this.pesos.value);
    siguiente.set(uid, pesos);
    this.pesos.next(siguiente);
  }
}
