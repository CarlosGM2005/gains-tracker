import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, type Observable } from 'rxjs';

import { DEMO_USER } from '@core/auth/mock/demo-user';
import { esperar, MOCK_LATENCY_MS } from '@core/data/mock-latency';

import { FavoritosRepository } from '../favoritos-repository';

@Injectable()
export class MockFavoritosRepository extends FavoritosRepository {
  private readonly latencia = inject(MOCK_LATENCY_MS);
  private readonly favoritos = new BehaviorSubject<ReadonlyMap<string, readonly string[]>>(
    new Map([[DEMO_USER.uid, ['ej-sentadilla', 'ej-press-de-banca']]]),
  );

  observar(uid: string): Observable<readonly string[]> {
    return this.favoritos.pipe(map((todos) => [...(todos.get(uid) ?? [])]));
  }

  async marcar(uid: string, ejercicioId: string, favorito: boolean): Promise<void> {
    await esperar(this.latencia);
    const actuales = (this.favoritos.value.get(uid) ?? []).filter((id) => id !== ejercicioId);
    const siguiente = new Map(this.favoritos.value);
    siguiente.set(uid, favorito ? [...actuales, ejercicioId] : actuales);
    this.favoritos.next(siguiente);
  }
}
