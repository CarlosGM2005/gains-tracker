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
      container-type: inline-size;
      mask-image: linear-gradient(90deg, transparent, rgb(0 0 0) 10%, rgb(0 0 0) 90%, transparent);
    }

    .marquee__track {
      display: flex;
      width: max-content;
      animation: marquee var(--marquee-duracion, 22s) linear infinite;
    }

    .marquee--reverse .marquee__track {
      animation-direction: reverse;
    }

    /* Cada copia mide al menos el ancho de la cinta (100cqi): así, al desplazarse la mitad del
       carril, siempre hay texto de borde a borde. Si sobra sitio, se reparte entre los elementos y
       la separación en la unión de las copias queda igual que entre elementos. */
    .marquee__group {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-around;
      gap: var(--space-6);
      min-width: 100cqi;
      padding-right: var(--space-6);
    }

    /* Tamaño, color y velocidad se pueden ajustar desde fuera con --marquee-*. */
    .marquee__item {
      font-family: var(--font-display);
      font-size: var(--marquee-size, var(--font-size-xl));
      color: var(--marquee-color, inherit);
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
