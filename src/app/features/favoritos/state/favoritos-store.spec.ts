import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AuthRepository } from '@core/auth/auth-repository';
import { type AuthUser } from '@core/auth/auth.model';
import { DEMO_USER } from '@core/auth/mock/demo-user';

import { FavoritosRepository } from '../data/favoritos-repository';
import { MockFavoritosRepository } from '../data/mock/mock-favoritos-repository';
import { FavoritosStore } from './favoritos-store';

describe('FavoritosStore', () => {
  let usuario$: BehaviorSubject<AuthUser | null | undefined>;
  let store: FavoritosStore;

  beforeEach(() => {
    usuario$ = new BehaviorSubject<AuthUser | null | undefined>(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthRepository, useValue: { usuario$ } },
        { provide: FavoritosRepository, useClass: MockFavoritosRepository },
      ],
    });
    store = TestBed.inject(FavoritosStore);
  });

  it('sin sesión no hay favoritos', () => {
    usuario$.next(null);
    TestBed.tick();

    expect(store.cargando()).toBe(false);
    expect(store.ids()).toEqual([]);
    expect(store.esFavorito('ej-sentadilla')).toBe(false);
  });

  it('lee los favoritos del usuario', () => {
    usuario$.next(DEMO_USER);
    TestBed.tick();

    expect(store.esFavorito('ej-sentadilla')).toBe(true);
  });

  it('marca y desmarca un ejercicio', async () => {
    usuario$.next(DEMO_USER);
    TestBed.tick();

    expect(await store.alternar('ej-plancha')).toBe(true);
    TestBed.tick();
    expect(store.ids().at(-1)).toBe('ej-plancha');

    expect(await store.alternar('ej-plancha')).toBe(false);
    TestBed.tick();
    expect(store.esFavorito('ej-plancha')).toBe(false);
  });

  it('sin sesión no deja marcar', async () => {
    usuario$.next(null);
    TestBed.tick();

    await expect(store.alternar('ej-plancha')).rejects.toMatchObject({ code: 'sin-sesion' });
  });
});
