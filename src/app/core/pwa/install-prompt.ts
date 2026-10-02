import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Ripple } from '@shared/ui/ripple/ripple';

import { InstalacionService } from './instalacion.service';

/**
 * Aviso de instalación. Aparece unos segundos después de entrar, una sola vez cada dos semanas si
 * se descarta, y nunca cuando la app ya está instalada. El texto cambia según la plataforma porque
 * el gesto también cambia: en iOS no hay diálogo nativo que ofrecer.
 */
@Component({
  selector: 'app-install-prompt',
  imports: [Ripple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (instalacion.avisoVisible()) {
      <aside class="instalar" role="region" aria-label="Instalar la aplicación">
        <img class="instalar__icono" src="icons/app/icon-192.png" alt="" width="44" height="44" />

        <div class="instalar__texto">
          <p class="instalar__titulo">Lleva GainsTracker en el móvil</p>
          <p class="instalar__sub">{{ subtitulo() }}</p>
        </div>

        <div class="instalar__acciones">
          <button
            type="button"
            class="btn btn--primary instalar__cta"
            appRipple
            (click)="instalacion.pedirInstalacion()"
          >
            {{ etiqueta() }}
          </button>
          <button type="button" class="instalar__cerrar" (click)="instalacion.descartar()">Ahora no</button>
        </div>
      </aside>
    }
  `,
  styles: `
    .instalar {
      position: fixed;
      inset-inline: var(--page-gutter);
      bottom: calc(var(--bottom-nav-height) + var(--space-3) + env(safe-area-inset-bottom));
      z-index: 40;
      display: grid;
      grid-template-areas: 'icono texto' 'acciones acciones';
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--space-3);
      align-items: center;
      max-width: 30rem;
      margin-inline: auto;
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: var(--shadow-card);
      animation: instalar-in 460ms var(--easing-spring) both;
    }

    @keyframes instalar-in {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
      }

      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .instalar {
        animation: none;
      }
    }

    .instalar__icono {
      grid-area: icono;
      border-radius: var(--radius-md);
    }

    .instalar__texto {
      grid-area: texto;
      min-width: 0;
    }

    .instalar__titulo {
      font-family: var(--font-display);
      font-size: var(--font-size-md);
      letter-spacing: var(--letter-spacing-display);
    }

    .instalar__sub {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .instalar__acciones {
      grid-area: acciones;
      display: flex;
      gap: var(--space-2);
      align-items: center;
      justify-content: flex-end;
    }

    .instalar__cta {
      position: relative;
      overflow: hidden;
    }

    .instalar__cerrar {
      min-height: var(--tap-target);
      padding-inline: var(--space-3);
      border: 0;
      background: none;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    @media (width >= 992px) {
      .instalar {
        inset-inline: auto var(--space-6);
        bottom: var(--space-6);
      }
    }
  `,
})
export class InstallPrompt {
  protected readonly instalacion = inject(InstalacionService);

  protected etiqueta(): string {
    return this.instalacion.modo() === 'automatico' ? 'Instalar' : 'Cómo se instala';
  }

  protected subtitulo(): string {
    switch (this.instalacion.modo()) {
      case 'guia-ios':
        return 'Dos toques en Safari y la tienes en la pantalla de inicio.';
      case 'abrir-en-safari':
        return 'Ábrela en Safari para poder instalarla.';
      default:
        return 'Se abre a pantalla completa y funciona sin conexión.';
    }
  }
}
