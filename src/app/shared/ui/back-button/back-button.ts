import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Vuelve a la página anterior del historial. Si se indica `fallback` (p. ej. en el login), navega
 * siempre a esa ruta: así no se vuelve a una página privada ni se sale de la app.
 */
@Component({
  selector: 'app-back-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="back" (click)="volver()">
      <span class="back__arrow" aria-hidden="true">←</span>
      <span class="back__text">{{ etiqueta() }}</span>
    </button>
  `,
  styles: `
    .back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: var(--tap-target);
      padding: 0 var(--space-3) 0 0;
      border: 0;
      background: none;
      font-family: var(--font-display);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--letter-spacing-label);
      text-transform: uppercase;
      color: var(--color-text-muted);
      transition: color var(--duration-fast) var(--easing-standard);
    }

    .back__arrow {
      display: inline-grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      transition: transform var(--duration-base) var(--easing-out), border-color var(--duration-base);
    }

    @media (hover: hover) {
      .back:hover {
        color: var(--color-text);
      }

      .back:hover .back__arrow {
        border-color: var(--color-accent);
        transform: translateX(-3px);
      }
    }
  `,
})
export class BackButton {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  readonly etiqueta = input('Volver');
  readonly fallback = input<string>();

  protected volver(): void {
    const destino = this.fallback();
    if (destino) {
      void this.router.navigateByUrl(destino);
    } else {
      this.location.back();
    }
  }
}
