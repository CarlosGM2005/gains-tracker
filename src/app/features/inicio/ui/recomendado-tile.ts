import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type Ejercicio } from '@features/ejercicios/public-api';
import { Ripple } from '@shared/ui/ripple/ripple';

/**
 * Tarjeta de un recomendado en el inicio: imagen de inicio, número de orden y nombre. Enlaza al
 * detalle (fase 8; en la app antigua no era un enlace).
 */
@Component({
  selector: 'app-recomendado-tile',
  imports: [RouterLink, Ripple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="tile" [routerLink]="['/ejercicios/detalle', ejercicio().id]">
      <span class="tile__media" appRipple>
        <img [src]="ejercicio().imagenInicio" alt="" width="400" height="300" loading="lazy" />
        <span class="tile__index" aria-hidden="true">
          <span class="tile__digits">{{ numero() }}</span>
        </span>
      </span>
      <span class="tile__name">{{ ejercicio().nombre }}</span>
    </a>
  `,
  styles: `
    .tile {
      display: grid;
      gap: var(--space-3);
      text-decoration: none;
      transition: transform var(--duration-base) var(--easing-out);
    }

    .tile:active {
      transform: scale(0.97);
      transition-duration: var(--duration-fast);
    }

    /* Tarjeta que despega: sube y se enmarca en naranja con puntero o teclado. */
    .tile:focus-visible {
      transform: translateY(-4px);
    }

    .tile__media {
      position: relative;
      display: block;
      overflow: hidden;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      aspect-ratio: 4 / 3;
    }

    .tile__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--duration-slow) var(--easing-out);
    }

    .tile__media::after {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 55%, rgb(0 0 0 / 55%));
      content: '';
    }

    /* Marco naranja: aparece con hover o foco y parpadea al pulsar en táctil. */
    .tile__media::before {
      position: absolute;
      inset: 0;
      z-index: 2;
      border: 2px solid var(--color-accent);
      border-radius: inherit;
      content: '';
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--duration-base) var(--easing-standard);
    }

    .tile:focus-visible .tile__media::before {
      opacity: 1;
    }

    .tile:active .tile__media::before {
      opacity: 1;
      transition-duration: var(--duration-fast);
    }

    .tile__index {
      position: absolute;
      bottom: var(--space-2);
      left: var(--space-3);
      z-index: 1;
      font-family: var(--font-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      line-height: 1;
      color: var(--color-accent);
      overflow: hidden;
      transition: transform var(--duration-base) var(--easing-out);
    }

    /* Dorsal que sube: el número sale de detrás de una máscara justo después de la tarjeta. El
       retardo usa el --i del <li> y espera al revelado de la sección (--entrada). */
    .tile__digits {
      display: block;
      animation: line-up var(--duration-slow) var(--easing-out) both;
      animation-delay: calc(var(--i, 0) * 70ms + 120ms);
      animation-play-state: var(--entrada, running);
    }

    .tile__name {
      font-family: var(--font-display);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--letter-spacing-display);
      text-transform: uppercase;
      transition: color var(--duration-base) var(--easing-standard);
    }

    @media (hover: hover) {
      .tile:hover {
        transform: translateY(-4px);
      }

      .tile:hover:active {
        transform: translateY(-2px) scale(0.98);
      }

      .tile:hover .tile__media::before {
        opacity: 1;
      }

      .tile:hover .tile__media img {
        transform: scale(1.06);
      }

      .tile:hover .tile__index {
        transform: translateX(4px);
      }

      .tile:hover .tile__name {
        color: var(--color-accent);
      }
    }

    /* Sin desplazamientos: quedan el marco y el color. */
    @media (prefers-reduced-motion: reduce) {
      .tile:hover,
      .tile:hover:active,
      .tile:focus-visible,
      .tile:active,
      .tile:hover .tile__media img,
      .tile:hover .tile__index {
        transform: none;
      }
    }
  `,
})
export class RecomendadoTile {
  readonly ejercicio = input.required<Ejercicio>();
  /** Posición en la lista, empezando en 0. */
  readonly indice = input.required<number>();

  protected readonly numero = computed(() => String(this.indice() + 1).padStart(2, '0'));
}
