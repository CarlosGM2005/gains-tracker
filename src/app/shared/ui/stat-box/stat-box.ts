import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Dato numérico grande con unidad y etiqueta (peso, edad, altura). Muestra "-" si falta o vale 0. */
@Component({
  selector: 'app-stat-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat">
      <p class="stat__value">
        {{ texto() }}
        @if (tieneValor() && unidad()) {
          <span class="stat__unit">{{ unidad() }}</span>
        }
      </p>
      <p class="text-label">{{ etiqueta() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .stat {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      text-align: center;
    }

    .stat__value {
      font-family: var(--font-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      line-height: 1;
    }

    .stat__unit {
      font-size: var(--font-size-sm);
      color: var(--color-accent);
    }
  `,
})
export class StatBox {
  readonly valor = input<number | null>();
  readonly unidad = input<string>();
  readonly etiqueta = input.required<string>();

  protected readonly tieneValor = computed(() => {
    const v = this.valor();
    return v !== null && v !== undefined && v > 0;
  });
  protected readonly texto = computed(() => (this.tieneValor() ? String(this.valor()) : '-'));
}
