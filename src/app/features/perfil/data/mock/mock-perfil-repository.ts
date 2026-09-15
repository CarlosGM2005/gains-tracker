import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, type Observable } from 'rxjs';

import { DEMO_USER } from '@core/auth/mock/demo-user';
import { esperar, MOCK_LATENCY_MS } from '@core/data/mock-latency';

import { type CambiosPerfil, type Perfil } from '../../domain/perfil.model';
import { PerfilRepository } from '../perfil-repository';

const PERFIL_DEMO: Perfil = {
  uid: DEMO_USER.uid,
  nombre: 'Demo',
  email: DEMO_USER.email,
  telefono: '600123456',
  edad: 28,
  peso: 75,
  altura: 1.78,
  foto: null,
  creadoEn: new Date('2025-05-01T10:00:00Z'),
};

@Injectable()
export class MockPerfilRepository extends PerfilRepository {
  private readonly latencia = inject(MOCK_LATENCY_MS);
  private readonly perfiles = new BehaviorSubject<ReadonlyMap<string, Perfil>>(
    new Map([[PERFIL_DEMO.uid, PERFIL_DEMO]]),
  );

  observar(uid: string): Observable<Perfil | null> {
    return this.perfiles.pipe(
      map((perfiles) => perfiles.get(uid) ?? null),
      distinctUntilChanged(),
      map((perfil) => (perfil ? { ...perfil } : null)),
    );
  }

  async crear(perfil: Perfil): Promise<void> {
    await esperar(this.latencia);
    this.guardar(perfil);
  }

  async crearSiNoExiste(perfil: Perfil): Promise<void> {
    await esperar(this.latencia);
    if (!this.perfiles.value.has(perfil.uid)) {
      this.guardar(perfil);
    }
  }

  async actualizar(uid: string, cambios: CambiosPerfil): Promise<void> {
    await esperar(this.latencia);
    this.guardar({ ...this.existente(uid), ...cambios });
  }

  async sincronizarEmail(uid: string, email: string): Promise<void> {
    await esperar(this.latencia);
    this.guardar({ ...this.existente(uid), email });
  }

  async borrar(uid: string): Promise<void> {
    await esperar(this.latencia);
    const siguiente = new Map(this.perfiles.value);
    siguiente.delete(uid);
    this.perfiles.next(siguiente);
  }

  private existente(uid: string): Perfil {
    const perfil = this.perfiles.value.get(uid);
    if (!perfil) {
      throw new Error(`No existe el perfil ${uid}`);
    }
    return perfil;
  }

  private guardar(perfil: Perfil): void {
    const siguiente = new Map(this.perfiles.value);
    siguiente.set(perfil.uid, { ...perfil });
    this.perfiles.next(siguiente);
  }
}
