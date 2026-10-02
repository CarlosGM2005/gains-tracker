import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';

import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog';

/** Cada cuánto se pregunta al servidor si hay una versión nueva. */
const INTERVALO_COMPROBACION_MS = 6 * 60 * 60 * 1000;

/**
 * Avisa cuando hay una versión nueva de la app.
 *
 * Con un service worker, el usuario se queda con la copia cacheada hasta que recarga: sin este
 * aviso, una corrección puede tardar días en llegarle. Angular descarga la versión nueva en
 * segundo plano y aquí solo se decide cuándo aplicarla, que obliga a recargar la página.
 */
@Injectable({ providedIn: 'root' })
export class ActualizacionService {
  private readonly updates = inject(SwUpdate);
  private readonly confirmacion = inject(ConfirmService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private preguntando = false;

  /** Lo llama `provideAppInitializer`. Sin service worker (desarrollo y tests) no hace nada. */
  iniciar(): void {
    if (!this.updates.isEnabled) return;

    this.updates.versionUpdates
      .pipe(
        filter((evento) => evento.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => void this.proponerRecarga());

    // La caché quedó en un estado inservible: recargar es la única salida.
    this.updates.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.document.defaultView?.location.reload();
    });

    this.comprobarPeriodicamente();
  }

  private async proponerRecarga(): Promise<void> {
    if (this.preguntando) return;
    this.preguntando = true;
    try {
      const recargar = await this.confirmacion.confirmar({
        titulo: 'Hay una versión nueva',
        mensaje:
          'Ya está descargada. Recarga para usarla; si estás a mitad de un entrenamiento, déjalo para luego.',
        confirmar: 'Recargar',
      });
      if (!recargar) return;
      await this.updates.activateUpdate();
      this.document.defaultView?.location.reload();
    } finally {
      this.preguntando = false;
    }
  }

  private comprobarPeriodicamente(): void {
    const ventana = this.document.defaultView;
    if (!ventana) return;

    const comprobar = () => void this.updates.checkForUpdate().catch(() => undefined);
    const temporizador = ventana.setInterval(comprobar, INTERVALO_COMPROBACION_MS);

    // Al volver a la app (instalada se queda abierta días) se mira si hay versión nueva.
    const alVolver = () => {
      if (this.document.visibilityState === 'visible') comprobar();
    };
    this.document.addEventListener('visibilitychange', alVolver);

    this.destroyRef.onDestroy(() => {
      ventana.clearInterval(temporizador);
      this.document.removeEventListener('visibilitychange', alVolver);
    });
  }
}
