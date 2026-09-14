import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra y cierra solo tras la duración indicada', () => {
    service.exito('¡Serie registrada con éxito!', 5000);
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]?.tipo).toBe('exito');

    vi.advanceTimersByTime(4999);
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts()).toHaveLength(0);
  });

  it('con duración 0 no se cierra solo', () => {
    const id = service.error('Error', 0);
    vi.advanceTimersByTime(60_000);
    expect(service.toasts()).toHaveLength(1);

    service.cerrar(id);
    expect(service.toasts()).toHaveLength(0);
  });
});
