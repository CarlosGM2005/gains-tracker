import { TestBed } from '@angular/core/testing';
import {
  type ActivatedRouteSnapshot,
  convertToParamMap,
  provideRouter,
  Router,
  type RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { nivelValidoGuard } from './nivel-valido.guard';

function ejecutar(nivel: string, queryParams: Record<string, string> = {}) {
  const route = { paramMap: convertToParamMap({ nivel }), queryParams } as unknown as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => nivelValidoGuard(route, {} as RouterStateSnapshot));
}

describe('nivelValidoGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
  });

  it('deja pasar un nivel válido en minúsculas', () => {
    expect(ejecutar('intermedio')).toBe(true);
  });

  it('normaliza mayúsculas conservando el músculo', () => {
    const resultado = ejecutar('Avanzado', { musculo: 'pecho' });

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/ejercicios/avanzado?musculo=pecho');
  });

  it('redirige a la elección de nivel si el nivel no existe', () => {
    expect(router.serializeUrl(ejecutar('experto') as UrlTree)).toBe('/ejercicios');
  });
});
