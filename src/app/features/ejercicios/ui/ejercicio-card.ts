import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type Ejercicio, ETIQUETA_MUSCULO, ETIQUETA_NIVEL } from '../domain/ejercicio.model';

/**
 * Tarjeta de ejercicio del catálogo: enlace al detalle. Con puntero, se eleva y la flecha avanza;
 * en táctil, se comprime al pulsar.
 */
@Component({
  selector: 'app-ejercicio-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card" [routerLink]="['/ejercicios/detalle', ejercicio().id]">
      <span class="card__media">
        <img [src]="ejercicio().imagenInicio" alt="" width="400" height="300" loading="lazy" />
      </span>
      <span class="card__body">
        <span class="card__name">{{ ejercicio().nombre }}</span>
        <span class="card__meta">
          {{ etiquetaMusculo[ejercicio().musculo] }} · {{ etiquetaNivel[ejercicio().nivel] }}
        </span>
      </span>
      <span class="card__arrow" aria-hidden="true">→</span>
    </a>
  `,
  styles: `
    .card {
      display: grid;
      grid-template-columns: 88px 1fr auto;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      text-decoration: none;
      transition:
        transform var(--duration-base) var(--easing-out),
        border-color var(--duration-base) var(--easing-standard);
    }

    .card:active {
      transform: scale(0.98);
    }

    .card__media {
      overflow: hidden;
      border-radius: var(--radius-md);
      aspect-ratio: 1;
    }

    .card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--duration-slow) var(--easing-out);
    }

    .card__body {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
    }

    .card__name {
      font-family: var(--font-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      line-height: 1.1;
      text-transform: uppercase;
    }

    .card__meta {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .card__arrow {
      display: grid;
      place-items: center;
      width: var(--tap-target);
      height: var(--tap-target);
      border-radius: 50%;
      background: var(--color-accent-soft);
      font-size: var(--font-size-lg);
      color: var(--color-accent);
      transition:
        transform var(--duration-base) var(--easing-out),
        background-color var(--duration-base);
    }

    @media (hover: hover) {
      .card:hover {
        border-color: var(--color-accent);
        transform: translateY(-3px);
      }

      .card:hover .card__media img {
        transform: scale(1.06);
      }

      .card:hover .card__arrow {
        background: var(--color-accent);
        color: var(--color-on-accent);
        transform: translateX(3px);
      }
    }
  `,
})
export class EjercicioCard {
  readonly ejercicio = input.required<Ejercicio>();

  protected readonly etiquetaMusculo = ETIQUETA_MUSCULO;
  protected readonly etiquetaNivel = ETIQUETA_NIVEL;
}
