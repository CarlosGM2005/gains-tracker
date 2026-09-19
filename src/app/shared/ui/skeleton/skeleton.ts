import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type FormaSkeleton = 'tile' | 'fila';

/**
 * Hueco de carga con destello. Imita la forma de la pieza que llegará para que la página no salte:
 * `tile` = imagen 4:3 + nombre (recomendados del inicio); `fila` = miniatura + dos líneas (tarjetas
 * de ejercicio y de registro). Es decorativo: el texto accesible de carga lo pone el contenedor.
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.skeleton--fila]': "forma() === 'fila'" },
  template: `
    <span class="skeleton__media"></span>
    <span class="skeleton__lineas">
      <span class="skeleton__linea"></span>
      @if (forma() === 'fila') {
        <span class="skeleton__linea skeleton__linea--corta"></span>
      }
    </span>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
    }

    :host(.skeleton--fila) {
      grid-template-columns: 64px 1fr;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    .skeleton__lineas {
      display: grid;
      gap: var(--space-2);
    }

    .skeleton__media,
    .skeleton__linea {
      position: relative;
      display: block;
      overflow: hidden;
      background: var(--color-surface);
    }

    /* Destello: degradado que cruza con transform; el retardo sale de --i del contenedor. */
    .skeleton__media::after,
    .skeleton__linea::after {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, var(--color-surface-2), transparent);
      content: '';
      animation: shimmer 1.4s var(--easing-standard) infinite both;
      animation-delay: calc(var(--i, 0) * 70ms);
    }

    .skeleton__media {
      border-radius: var(--radius-md);
      aspect-ratio: 4 / 3;
    }

    :host(.skeleton--fila) .skeleton__media {
      aspect-ratio: 1;
    }

    .skeleton__linea {
      width: 70%;
      height: 1.1em;
      border-radius: var(--radius-sm);
    }

    .skeleton__linea--corta {
      width: 45%;
      height: 0.8em;
    }

    /* Sin destello: queda el hueco gris. */
    @media (prefers-reduced-motion: reduce) {
      .skeleton__media::after,
      .skeleton__linea::after {
        display: none;
      }
    }
  `,
})
export class Skeleton {
  readonly forma = input<FormaSkeleton>('tile');
}
