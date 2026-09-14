import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cinta de texto en bucle (ticker). El texto se duplica para que el bucle no tenga salto;
 * los lectores de pantalla solo leen la versión oculta. Se pausa con hover y con
 * prefers-reduced-motion queda fija.
 */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="visually-hidden">{{ items().join('. ') }}</p>
    <div class="marquee" aria-hidden="true" [class.marquee--reverse]="invertir()">
      <div class="marquee__track">
        @for (copia of copias; track copia) {
          <div class="marquee__group">
            @for (item of items(); track $index) {
              <span class="marquee__item">{{ item }}</span>
              <span class="marquee__sep">✦</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .marquee {
      overflow: hidden;
      mask-image: linear-gradient(90deg, transparent, rgb(0 0 0) 10%, rgb(0 0 0) 90%, transparent);
    }

    .marquee__track {
      display: flex;
      width: max-content;
      animation: marquee 22s linear infinite;
    }

    .marquee--reverse .marquee__track {
      animation-direction: reverse;
    }

    .marquee__group {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      padding-right: var(--space-6);
    }

    .marquee__item {
      font-family: var(--font-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      letter-spacing: var(--letter-spacing-display);
      text-transform: uppercase;
      white-space: nowrap;
    }

    .marquee__sep {
      color: var(--color-accent);
    }

    @media (hover: hover) {
      .marquee:hover .marquee__track {
        animation-play-state: paused;
      }
    }
  `,
})
export class Marquee {
  readonly items = input.required<readonly string[]>();
  readonly invertir = input(false);

  protected readonly copias = [0, 1];
}
