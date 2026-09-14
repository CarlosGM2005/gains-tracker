import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthStore } from '@core/auth/auth-store';
import { DEMO_PASSWORD, DEMO_USER } from '@core/auth/mock/demo-user';
import { ToastService } from '@core/notifications/toast.service';
import { TEST_ENVIRONMENT } from '@env/environment.testing';

import { provideDataLayer } from '../../../app.data';
import { RegistrosStore } from '../state/registros-store';
import { RegistrarSerieDialog } from './registrar-serie-dialog';

async function montar() {
  const close = vi.fn();
  TestBed.configureTestingModule({
    imports: [RegistrarSerieDialog],
    providers: [
      provideRouter([]),
      provideDataLayer(TEST_ENVIRONMENT),
      { provide: DialogRef, useValue: { close } },
      { provide: DIALOG_DATA, useValue: { id: 'ej-plancha', nombre: 'Plancha', imagenFinal: 'final.svg' } },
    ],
  });
  await TestBed.inject(AuthStore).sesionResuelta();
  return { close };
}

function escribir(html: HTMLElement, selector: string, valor: string): void {
  const input = html.querySelector<HTMLInputElement>(selector);
  if (!input) {
    throw new Error(`No existe ${selector}`);
  }
  input.value = valor;
  input.dispatchEvent(new Event('input'));
}

describe('RegistrarSerieDialog', () => {
  it('sin sesión avisa y no muestra el formulario', async () => {
    await montar();
    const fixture = TestBed.createComponent(RegistrarSerieDialog);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('No puedes registrar una serie porque no has iniciado sesión.');
    expect(html.querySelector('form')).toBeNull();
  });

  it('con sesión guarda la serie, cierra y avisa', async () => {
    const { close } = await montar();
    await TestBed.inject(AuthStore).loginConEmail(DEMO_USER.email, DEMO_PASSWORD);
    const toast = vi.spyOn(TestBed.inject(ToastService), 'exito');

    const fixture = TestBed.createComponent(RegistrarSerieDialog);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;

    escribir(html, '#serie-dia', '2026-09-13');
    escribir(html, '#serie-series', '4');
    escribir(html, '#serie-reps', '10');
    escribir(html, '#serie-peso', '0');
    escribir(html, '#serie-descanso', '1');
    html.querySelector('form')?.dispatchEvent(new Event('submit'));

    await vi.waitFor(() => expect(close).toHaveBeenCalledWith(true));
    TestBed.tick();
    expect(toast).toHaveBeenCalledWith('¡Serie registrada con éxito!', 5000);
    const registros = TestBed.inject(RegistrosStore).registros();
    expect(registros.find((r) => r.ejercicioId === 'ej-plancha')?.series[0]).toMatchObject({ series: 4, peso: 0 });
  });
});
