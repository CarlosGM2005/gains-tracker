import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type Ejercicio } from '@features/ejercicios/public-api';

/**
 * Tarjeta de un recomendado en el inicio: imagen de inicio, número de orden y nombre. Enlaza al
 * detalle (fase 8; en la app antigua no era un enlace).
 */
@Component({
  selector: 'app-recomendado-tile',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="tile" [routerLink]="['/ejercicios/detalle', ejercicio().id]">
      <span class="tile__media">
        <img [src]="ejercicio().imagenInicio" alt="" width="400" height="300" loading="lazy" />
        <span class="tile__index" aria-hidden="true">{{ numero() }}</span>
      </span>
      <span class="tile__name">{{ ejercicio().nombre }}</span>
    </a>
  `,
  styles: `
    .tile {
      display: grid;
      gap: var(--space-3);
      text-decoration: none;
      transition: transform var(--duration-fast) var(--easing-standard);
    }

    .tile:active {
      transform: scale(0.97);
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
      .tile:hover .tile__media img {
        transform: scale(1.06);
      }

      .tile:hover .tile__name {
        color: var(--color-accent);
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
