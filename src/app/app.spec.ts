import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { TEST_ENVIRONMENT } from '@env/environment.testing';

import { App } from './app';
import { provideDataLayer } from './app.data';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideDataLayer(TEST_ENVIRONMENT)],
    }).compileComponents();
  });

  it('se crea', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('redirige las URL antiguas a las nuevas', async () => {
    const router = TestBed.inject(Router);
    TestBed.createComponent(App);

    await router.navigateByUrl('/main/privacy-policy');
    expect(router.url).toBe('/privacidad');

    // Sin sesión, la ruta privada acaba en el login recordando el destino.
    await router.navigateByUrl('/main/records');
    expect(router.url).toBe('/login?returnUrl=%2Fregistros');

    await router.navigateByUrl('/main/exercices/avanzado');
    expect(router.url).toBe('/ejercicios/avanzado');
  });

  it('lleva el detalle antiguo por nombre al detalle nuevo por id', async () => {
    const router = TestBed.inject(Router);
    TestBed.createComponent(App);

    await router.navigateByUrl('/main/info-exercice/Sentadilla');
    expect(router.url).toBe('/ejercicios/detalle/ej-sentadilla');
  });

  it('normaliza el nivel y rechaza niveles desconocidos', async () => {
    const router = TestBed.inject(Router);
    TestBed.createComponent(App);

    await router.navigateByUrl('/ejercicios/Principiante?musculo=pecho');
    expect(router.url).toBe('/ejercicios/principiante?musculo=pecho');

    await router.navigateByUrl('/ejercicios/experto');
    expect(router.url).toBe('/ejercicios');
  });
});
