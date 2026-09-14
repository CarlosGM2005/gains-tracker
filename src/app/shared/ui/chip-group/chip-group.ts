import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface ChipOption<T extends string = string> {
  valor: T;
  etiqueta: string;
}

/**
 * Selector de una opción en forma de chips con scroll horizontal (músculos).
 * Botones con `aria-pressed`: una sola opción activa; se recorren con Tab.
 */
@Component({
  selector: 'app-chip-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chips" role="group" [attr.aria-label]="etiqueta()">
      @for (opcion of opciones(); track opcion.valor) {
        <button
          type="button"
          class="chip"
          [class.chip--activo]="opcion.valor === seleccionado()"
          [attr.aria-pressed]="opcion.valor === seleccionado()"
          (click)="seleccionado.set(opcion.valor)"
        >
          {{ opcion.etiqueta }}
        </button>
      }
    </div>
  `,
  styles: `
    .chips {
      display: flex;
      gap: var(--space-2);
      margin-inline: calc(var(--page-gutter) * -1);
      padding: var(--space-1) var(--page-gutter);
      overflow-x: auto;
      scroll-snap-type: x proximity;
      scrollbar-width: none;
    }

    .chip {
      flex-shrink: 0;
      min-height: var(--tap-target);
      padding: 0 var(--space-5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      background: var(--color-surface);
      font-family: var(--font-display);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--letter-spacing-label);
      text-transform: uppercase;
      color: var(--color-text-muted);
      scroll-snap-align: start;
      transition:
        background-color var(--duration-base) var(--easing-standard),
        color var(--duration-base) var(--easing-standard),
        transform var(--duration-fast) var(--easing-standard);
    }

    .chip:active {
      transform: scale(0.95);
    }

    .chip--activo {
      border-color: var(--color-accent);
      background: var(--color-accent);
      color: var(--color-on-accent);
    }

    @media (hover: hover) {
      .chip:not(.chip--activo):hover {
        border-color: var(--color-accent);
        color: var(--color-text);
      }
    }
  `,
})
export class ChipGroup<T extends string = string> {
  readonly opciones = input.required<readonly ChipOption<T>[]>();
  readonly seleccionado = model.required<T>();
  /** Nombre accesible del grupo (p. ej. "Músculo"). */
  readonly etiqueta = input.required<string>();
}
