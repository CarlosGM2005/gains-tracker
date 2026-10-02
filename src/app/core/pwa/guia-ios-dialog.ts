import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';

import { ToastService } from '@core/notifications/toast.service';

import { esIOS } from './plataforma';

/**
 * Explica el gesto de instalación de iOS. Safari no expone ningún diálogo nativo
 * (`beforeinstallprompt` no existe en WebKit), así que la única opción honesta es enseñar
 * los tres pasos con los iconos reales de la barra de Safari.
 */
@Component({
  selector: 'app-guia-ios-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dialog guia">
      <header class="dialog__head">
        <div>
          <p class="dialog__overline">En tu {{ dispositivo }}</p>
          <h2 id="guia-ios-titulo" class="dialog__title">Instala GainsTracker</h2>
        </div>
        <button type="button" class="dialog__close" aria-label="Cerrar" (click)="ref.close()">×</button>
      </header>

      <p id="guia-ios-texto" class="dialog__text">
        Queda como una app más: icono propio, pantalla completa y sin barra del navegador.
      </p>

      <ol class="guia__pasos">
        <li class="guia__paso">
          <span class="guia__num" aria-hidden="true">1</span>
          <p>
            Pulsa
            <svg class="guia__icono" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3.5 8.5 7M12 3.5 15.5 7M12 3.5v11"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 10H5.5v9.5h13V10H17"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <strong>Compartir</strong> en {{ dondeEstaCompartir }}.
          </p>
        </li>
        <li class="guia__paso">
          <span class="guia__num" aria-hidden="true">2</span>
          <p>
            Baja por la lista y elige
            <svg class="guia__icono" viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <strong>Añadir a pantalla de inicio</strong>.
          </p>
        </li>
        <li class="guia__paso">
          <span class="guia__num" aria-hidden="true">3</span>
          <p>Confirma con <strong>Añadir</strong>. El icono naranja aparece junto a tus apps.</p>
        </li>
      </ol>

      <p class="guia__nota">Si no ves la opción, comprueba que estás en Safari y no dentro de otra app.</p>
    </section>
  `,
  styles: `
    .guia__pasos {
      display: grid;
      gap: var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .guia__paso {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      line-height: var(--line-height-base);
    }

    .guia__num {
      display: grid;
      flex: none;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--color-accent-soft);
      font-family: var(--font-display);
      font-size: var(--font-size-sm);
      color: var(--color-accent);
    }

    /* Los iconos van en el texto, a la altura de la línea, como en la barra real de Safari. */
    .guia__icono {
      width: 1.25em;
      height: 1.25em;
      margin: 0 0.1em;
      vertical-align: -0.3em;
      color: var(--color-accent);
    }

    .guia__nota {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  `,
})
export class GuiaIOSDialog {
  protected readonly ref = inject<DialogRef<void>>(DialogRef);

  /** En iPhone el botón está en la barra de abajo; en iPad, arriba a la derecha. */
  protected readonly dispositivo = esTablet() ? 'iPad' : 'iPhone';
  protected readonly dondeEstaCompartir = esTablet()
    ? 'la barra de arriba a la derecha'
    : 'la barra de abajo de Safari';
}

/**
 * Mensaje para iOS cuando la página se abre dentro de otra app (Instagram, Gmail…).
 * Desde esos navegadores incrustados iOS no deja añadir a la pantalla de inicio.
 */
@Component({
  selector: 'app-abrir-safari-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dialog">
      <header class="dialog__head">
        <div>
          <p class="dialog__overline">Un paso antes</p>
          <h2 id="guia-ios-titulo" class="dialog__title">Ábrela en Safari</h2>
        </div>
        <button type="button" class="dialog__close" aria-label="Cerrar" (click)="ref.close()">×</button>
      </header>

      <p id="guia-ios-texto" class="dialog__text">
        Estás viendo GainsTracker dentro de otra app. iOS solo permite instalar desde Safari: abre el menú de
        esta app y elige <strong>Abrir en Safari</strong>, o copia el enlace y pégalo allí.
      </p>

      <div class="dialog__actions">
        <button type="button" class="btn btn--ghost" (click)="ref.close()">Cerrar</button>
        <button type="button" class="btn btn--primary" (click)="copiar()">Copiar enlace</button>
      </div>
    </section>
  `,
})
export class AbrirSafariDialog {
  protected readonly ref = inject<DialogRef<void>>(DialogRef);
  private readonly toasts = inject(ToastService);

  protected async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(location.href);
      this.toasts.exito('Enlace copiado. Pégalo en Safari.');
    } catch {
      this.toasts.error('No se pudo copiar. Copia la dirección desde la barra del navegador.');
    }
    this.ref.close();
  }
}

/** Abre la ventana que corresponda a cada situación de iOS. */
@Injectable({ providedIn: 'root' })
export class GuiaInstalacionIOS {
  private readonly dialog = inject(Dialog);

  abrirGuia(): void {
    this.abrir(GuiaIOSDialog);
  }

  abrirAvisoSafari(): void {
    this.abrir(AbrirSafariDialog);
  }

  private abrir(componente: typeof GuiaIOSDialog | typeof AbrirSafariDialog): void {
    this.dialog.open<void>(componente, {
      ariaLabelledBy: 'guia-ios-titulo',
      ariaDescribedBy: 'guia-ios-texto',
      panelClass: 'gt-dialog-panel',
      backdropClass: 'gt-dialog-backdrop',
      width: 'min(100vw, 28rem)',
      maxWidth: '100vw',
    });
  }
}

function esTablet(): boolean {
  return esIOS() && !/iPhone|iPod/.test(navigator.userAgent);
}
