import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AuthRepository } from '@core/auth/auth-repository';
import { type AuthUser } from '@core/auth/auth.model';
import { DEMO_USER } from '@core/auth/mock/demo-user';

import { RegistrosRepository } from '../data/registros-repository';
import { MockRegistrosRepository } from '../data/mock/mock-registros-repository';
import { RegistrosStore } from './registros-store';

describe('RegistrosStore', () => {
  let usuario$: BehaviorSubject<AuthUser | null | undefined>;
  let store: RegistrosStore;

  beforeEach(() => {
    usuario$ = new BehaviorSubject<AuthUser | null | undefined>(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthRepository, useValue: { usuario$ } },
        { provide: RegistrosRepository, useClass: MockRegistrosRepository },
      ],
    });
    store = TestBed.inject(RegistrosStore);
  });

  it('está cargando mientras no se resuelve la sesión', () => {
    TestBed.tick();
    expect(store.cargando()).toBe(true);
  });

  it('sin sesión no hay registros', () => {
    usuario$.next(null);
    TestBed.tick();

    expect(store.cargando()).toBe(false);
    expect(store.registros()).toEqual([]);
  });

  it('ordena por el día más reciente y las series de nueva a antigua', () => {
    usuario$.next(DEMO_USER);
    TestBed.tick();

    const [primero, segundo] = store.registros();
    expect(primero?.nombre).toBe('Sentadilla'); // último día 2025-06-10
    expect(segundo?.series.map((s) => s.dia)).toEqual(['2025-06-09', '2025-06-02']);
  });

  it('refleja al momento una serie nueva (tiempo real)', async () => {
    usuario$.next(DEMO_USER);
    TestBed.tick();

    await store.agregarSerie(
      { id: 'ej-plancha', nombre: 'Plancha', imagenFinal: 'final.svg' },
      { dia: '2026-09-13', series: 3, repeticiones: 1, peso: 0, descansoMin: 1 },
    );
    TestBed.tick();

    expect(store.registros()[0]?.nombre).toBe('Plancha');
  });

  it('al cerrar sesión vacía los registros', () => {
    usuario$.next(DEMO_USER);
    TestBed.tick();
    usuario$.next(null);
    TestBed.tick();

    expect(store.registros()).toEqual([]);
  });

  it('edita y borra series del usuario actual', async () => {
    usuario$.next(DEMO_USER);
    TestBed.tick();
    const sentadilla = store.registros().find((r) => r.nombre === 'Sentadilla')!;
    const serie = sentadilla.series[0]!;

    await store.actualizarSerie(sentadilla.ejercicioId, serie.id, { ...serie, repeticiones: 3 });
    TestBed.tick();
    expect(store.registros().find((r) => r.nombre === 'Sentadilla')?.series[0]?.repeticiones).toBe(3);

    await store.borrarSerie(sentadilla.ejercicioId, serie.id);
    TestBed.tick();
    expect(store.registros().map((r) => r.nombre)).toEqual(['Press de banca']);
  });
});
