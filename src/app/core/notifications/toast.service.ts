import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}

/** Avisos no bloqueantes. Sustituye a los `alert()` de la app antigua. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private siguienteId = 0;
  private readonly lista = signal<readonly Toast[]>([]);

  readonly toasts = this.lista.asReadonly();

  mostrar(mensaje: string, tipo: TipoToast = 'info', duracionMs = 5000): number {
    const id = ++this.siguienteId;
    this.lista.update((actuales) => [...actuales, { id, mensaje, tipo }]);
    if (duracionMs > 0) {
      setTimeout(() => this.cerrar(id), duracionMs);
    }
    return id;
  }

  exito(mensaje: string, duracionMs?: number): number {
    return this.mostrar(mensaje, 'exito', duracionMs);
  }

  error(mensaje: string, duracionMs?: number): number {
    return this.mostrar(mensaje, 'error', duracionMs);
  }

  cerrar(id: number): void {
    this.lista.update((actuales) => actuales.filter((t) => t.id !== id));
  }
}
