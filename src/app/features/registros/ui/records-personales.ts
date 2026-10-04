import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { diaLocal, sumarDias } from '@shared/utils/fechas';

import { type RecordPersonal } from '../domain/estadisticas';

/** Cuántos récords se ven antes de pulsar "Ver todos". */
const VISIBLES = 5;
/** Un récord de los últimos días lleva la etiqueta "Nuevo". */
const DIAS_NUEVO = 7;

/**
 * Lista de récords personales: la mejor serie de cada ejercicio, del más reciente al más antiguo,
 * con la repetición máxima estimada (fórmula de Epley).
 */
@Component({
  selector: 'app-records-personales',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="records">
      @for (r of visibles(); track r.ejercicioId) {
        <li class="record">
          <img class="record__img" [src]="r.imagen" alt="" width="48" height="48" loading="lazy" />
          <div class="record__info">
            <p class="record__nombre">
              {{ r.nombre }}
              @if (r.dia >= desdeNuevo) {
                <span class="record__nuevo">Nuevo</span>
              }
            </p>
            <p class="record__fecha">
              <time [attr.datetime]="r.dia">{{ r.dia | date: 'd MMM y' }}</time>
              @if (r.unaRm !== null && r.repeticiones > 1) {
                · 1RM ≈ {{ r.unaRm | number: '1.0-0' }} kg
              }
            </p>
          </div>
          <p class="record__marca">
            @if (r.peso > 0) {
              {{ r.peso | number: '1.0-2' }} <small>kg × {{ r.repeticiones }}</small>
            } @else {
              {{ r.repeticiones }} <small>reps</small>
            }
          </p>
        </li>
      }
    </ol>

    @if (records().length > visiblesIniciales) {
      <button type="button" class="btn btn--ghost records__mas" (click)="todos.set(!todos())">
        {{ todos() ? 'Ver menos' : 'Ver todos (' + records().length + ')' }}
      </button>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
    }

    .records {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .record {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);
    }

    .record__img {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }

    .record__info {
      min-width: 0;
    }

    .record__nombre {
      overflow: hidden;
      margin: 0;
      font-weight: var(--font-weight-semibold);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .record__nuevo {
      margin-left: var(--space-2);
      padding: 1px var(--space-2);
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      font-size: var(--font-size-xs);
      letter-spacing: var(--letter-spacing-label);
      text-transform: uppercase;
      color: var(--color-on-accent);
    }

    .record__fecha {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .record__marca {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--color-accent);

      small {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
      }
    }

    .records__mas {
      justify-self: start;
    }
  `,
})
export class RecordsPersonales {
  readonly records = input.required<readonly RecordPersonal[]>();

  protected readonly visiblesIniciales = VISIBLES;
  protected readonly desdeNuevo = sumarDias(diaLocal(new Date()), -DIAS_NUEVO);
  protected readonly todos = signal(false);
  protected readonly visibles = computed(() =>
    this.todos() ? this.records() : this.records().slice(0, VISIBLES),
  );
}
