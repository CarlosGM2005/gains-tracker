import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { type Racha } from '../domain/estadisticas';

/** Racha de días seguidos entrenando: la actual en grande, la mejor y qué hacer para no perderla. */
@Component({
  selector: 'app-racha-dias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let r = racha();
    <div class="racha" [class.racha--viva]="r.actual > 0">
      <p class="racha__cifra">
        <span class="racha__numero">{{ r.actual }}</span>
        <span class="racha__unidad">{{ r.actual === 1 ? 'día seguido' : 'días seguidos' }}</span>
      </p>
      <p class="racha__mensaje">{{ mensaje() }}</p>
      <p class="racha__mejor text-label">Mejor racha: {{ r.mejor }} {{ r.mejor === 1 ? 'día' : 'días' }}</p>
    </div>
  `,
  styles: `
    .racha {
      display: grid;
      gap: var(--space-2);
    }

    .racha__cifra {
      display: flex;
      align-items: baseline;
      gap: var(--space-3);
      margin: 0;
    }

    .racha__numero {
      font-family: var(--font-display);
      font-size: var(--font-size-hero);
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      line-height: 1;
      color: var(--color-text-muted);
    }

    .racha--viva .racha__numero {
      color: var(--color-accent);
    }

    .racha__unidad {
      font-family: var(--font-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
    }

    .racha__mensaje {
      margin: 0;
      color: var(--color-text-muted);
    }

    .racha__mejor {
      margin: 0;
    }
  `,
})
export class RachaDias {
  readonly racha = input.required<Racha>();

  protected readonly mensaje = computed(() => {
    const { actual, mejor, entrenadoHoy } = this.racha();
    if (actual === 0) {
      return 'Registra una serie hoy para empezar una racha.';
    }
    if (!entrenadoHoy) {
      return 'Entrena hoy para no perderla.';
    }
    return actual >= mejor
      ? '¡Es tu mejor racha! Sigue así.'
      : `Te faltan ${mejor - actual + 1} para batir tu mejor marca.`;
  });
}
