import { type ErrorHandler, inject, Injectable } from '@angular/core';

import { ToastService } from '../notifications/toast.service';

const PAUSA_ENTRE_AVISOS_MS = 5000;

/**
 * Errores no controlados: se registran en consola y se avisa al usuario sin bloquearle.
 * Varios errores seguidos producen un solo aviso.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toasts = inject(ToastService);
  private ultimoAviso = 0;

  handleError(error: unknown): void {
    console.error(error);
    const ahora = Date.now();
    if (ahora - this.ultimoAviso > PAUSA_ENTRE_AVISOS_MS) {
      this.ultimoAviso = ahora;
      this.toasts.error('Ha ocurrido un error inesperado. Si se repite, recarga la página.');
    }
  }
}
