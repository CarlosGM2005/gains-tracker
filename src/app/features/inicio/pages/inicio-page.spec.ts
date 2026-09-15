import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { type Ejercicio, EjerciciosRepository } from '@features/ejercicios/public-api';

import { InicioPage } from './inicio-page';

function ejercicio(n: number): Ejercicio {
  return {
    id: `ej-${n}`,
    nombre: `Ejercicio ${n}`,
    musculo: 'pecho',
    nivel: 'intermedio',
    musculosImplicados: null,
    descripcion: '',
    imagenInicio: 'inicio.svg',
    imagenFinal: 'final.svg',
    recomendado: true,
  };
}

async function renderizar(recomendados: () => Promise<Ejercicio[]>) {
  TestBed.configureTestingModule({
    imports: [InicioPage],
    providers: [provideRouter([]), { provide: EjerciciosRepository, useValue: { recomendados } }],
  });
  const fixture = TestBed.createComponent(InicioPage);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('InicioPage', () => {
  it('muestra como máximo 8 recomendados', async () => {
    const html = await renderizar(async () => Array.from({ length: 12 }, (_, i) => ejercicio(i)));

    expect(html.querySelectorAll('app-recomendado-tile')).toHaveLength(8);
  });

  it('muestra todos si hay menos de 8', async () => {
    const html = await renderizar(async () => [ejercicio(1), ejercicio(2)]);

    expect(html.querySelectorAll('app-recomendado-tile')).toHaveLength(2);
  });

  it('muestra el estado vacío sin recomendados', async () => {
    const html = await renderizar(async () => []);

    expect(html.textContent).toContain('Todavía no hay ejercicios recomendados');
  });

  it('muestra el error con opción de reintentar', async () => {
    const html = await renderizar(async () => {
      throw new Error('sin red');
    });

    expect(html.textContent).toContain('No se pudieron cargar los recomendados');
    const botones = Array.from(html.querySelectorAll('button'), (b) => b.textContent?.trim());
    expect(botones).toContain('Reintentar');
  });

  it('cada recomendado enlaza a su detalle', async () => {
    const html = await renderizar(async () => [ejercicio(1), ejercicio(2)]);

    expect(html.querySelector('app-recomendado-tile a[href="/ejercicios/detalle/ej-1"]')).not.toBeNull();
  });

  it('enlaza a todos los recomendados', async () => {
    const html = await renderizar(async () => []);

    expect(html.querySelector('a[href="/recomendados"]')).not.toBeNull();
  });
});
