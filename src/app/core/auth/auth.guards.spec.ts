import { TestBed } from '@angular/core/testing';
import {
  type ActivatedRouteSnapshot,
  provideRouter,
  Router,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AuthRepository } from './auth-repository';
import { authGuard, destinoSeguro, guestGuard } from './auth.guards';
import { type AuthUser } from './auth.model';

const USUARIO: AuthUser = { uid: 'u1', email: 'a@b.es', nombre: 'A', proveedor: 'password', emailVerificado: true };

describe('guards de sesión', () => {
  let usuario$: BehaviorSubject<AuthUser | null | undefined>;
  let router: Router;

  beforeEach(() => {
    usuario$ = new BehaviorSubject<AuthUser | null | undefined>(undefined);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthRepository, useValue: { usuario$ } }],
    });
    router = TestBed.inject(Router);
  });

  const ejecutar = (guard: typeof authGuard, url = '/registros') =>
    TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    ) as Promise<boolean | UrlTree>;

  it('authGuard espera a que se resuelva la sesión y deja pasar con usuario', async () => {
    const resultado = ejecutar(authGuard);
    usuario$.next(USUARIO);

    expect(await resultado).toBe(true);
  });

  it('authGuard sin sesión lleva al login con returnUrl', async () => {
    usuario$.next(null);
    const resultado = (await ejecutar(authGuard, '/perfil')) as UrlTree;

    expect(router.serializeUrl(resultado)).toBe('/login?returnUrl=%2Fperfil');
  });

  it('guestGuard con sesión lleva al inicio', async () => {
    usuario$.next(USUARIO);
    const resultado = (await ejecutar(guestGuard)) as UrlTree;

    expect(router.serializeUrl(resultado)).toBe('/inicio');
  });

  it('guestGuard sin sesión deja pasar', async () => {
    usuario$.next(null);
    expect(await ejecutar(guestGuard)).toBe(true);
  });
});

describe('destinoSeguro', () => {
  it('acepta rutas internas y rechaza externas', () => {
    expect(destinoSeguro('/registros')).toBe('/registros');
    expect(destinoSeguro('https://malo.com')).toBe('/inicio');
    expect(destinoSeguro('//malo.com')).toBe('/inicio');
    expect(destinoSeguro(undefined)).toBe('/inicio');
  });
});
