import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { type Ejercicio } from '@features/ejercicios/public-api';

/**
 * Tarjeta de un recomendado en el inicio: imagen de inicio, número de orden y nombre.
 * Igual que en la app actual, no es un enlace (ver wiki: funcionalidad implícita 8).
 */
@Component({
  selector: 'app-recomendado-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="tile">
      <div class="tile__media">
        <img [src]="ejercicio().imagenInicio" alt="" width="400" height="300" loading="lazy" />
        <span class="tile__index" aria-hidden="true">{{ numero() }}</span>
      </div>
      <figcaption class="tile__name">{{ ejercicio().nombre }}</figcaption>
    </figure>
  `,
  styles: `
    .tile {
      display: grid;
      gap: var(--space-3);
      margin: 0;
    }

    .tile__media {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      aspect-ratio: 4 / 3;
    }

    .tile__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
    }
  `,
})
export class RecomendadoTile {
  readonly ejercicio = input.required<Ejercicio>();
  /** Posición en la lista, empezando en 0. */
  readonly indice = input.required<number>();

  protected readonly numero = computed(() => String(this.indice() + 1).padStart(2, '0'));
}
