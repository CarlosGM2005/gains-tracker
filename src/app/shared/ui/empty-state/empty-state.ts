import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Mensaje para listas vacías o errores. Acciones opcionales por `<ng-content>`. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" [class.empty--error]="tipo() === 'error'" [attr.role]="tipo() === 'error' ? 'alert' : null">
      <span class="empty__mark" aria-hidden="true">{{ tipo() === 'error' ? '!' : '0' }}</span>
      <p class="empty__title">{{ titulo() }}</p>
      @if (detalle()) {
        <p class="empty__detail">{{ detalle() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .empty {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      padding: var(--space-10) var(--space-6);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .empty__mark {
      font-family: var(--font-display);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      line-height: 1;
      color: var(--color-accent);
    }

    .empty--error .empty__mark {
      color: var(--color-danger);
    }

    .empty__title {
      font-weight: var(--font-weight-semibold);
    }

    .empty__detail {
      color: var(--color-text-muted);
    }
  `,
})
export class EmptyState {
  readonly titulo = input.required<string>();
  readonly detalle = input<string>();
  readonly tipo = input<'vacio' | 'error'>('vacio');
}
