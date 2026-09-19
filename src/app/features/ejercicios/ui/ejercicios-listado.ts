import { ChangeDetectionStrategy, Component, input, output, type Resource } from '@angular/core';

import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { Skeleton } from '@shared/ui/skeleton/skeleton';

import { type Ejercicio } from '../domain/ejercicio.model';
import { EjercicioCard } from './ejercicio-card';

export type EstadoListado = 'cargando' | 'error' | 'listo';

/** Traduce el estado de un `resource()` al de los listados. */
export function estadoListado(recurso: Resource<unknown>): EstadoListado {
  if (recurso.error()) {
    return 'error';
  }
  return recurso.hasValue() && !recurso.isLoading() ? 'listo' : 'cargando';
}

/** Resumen con contador + lista de tarjetas + estados de carga, vacío y error. */
@Component({
  selector: 'app-ejercicios-listado',
  imports: [EjercicioCard, EmptyState, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="resumen" aria-live="polite">
      <p>{{ resumen() }}</p>
      @if (estado() === 'listo') {
        <p class="resumen__contador" [attr.aria-label]="ejercicios().length + ' ejercicios'">
          {{ ejercicios().length }}
        </p>
      }
    </div>

    @switch (estado()) {
      @case ('cargando') {
        <div role="status">
          <span class="visually-hidden">Cargando ejercicios</span>
          <ul class="lista" aria-hidden="true">
            @for (hueco of huecos; track $index; let i = $index) {
              <li [style.--i]="i"><app-skeleton forma="fila" /></li>
            }
          </ul>
        </div>
      }
      @case ('error') {
        <app-empty-state tipo="error" titulo="No se pudieron cargar los ejercicios" detalle="Inténtalo de nuevo.">
          <button type="button" class="btn btn--ghost" (click)="reintentar.emit()">Reintentar</button>
        </app-empty-state>
      }
      @default {
        @if (ejercicios().length === 0) {
          <app-empty-state [titulo]="textoVacio()" />
        } @else {
          <ul class="lista">
            @for (ejercicio of ejercicios(); track ejercicio.id; let i = $index) {
              <li class="stagger" [style.--i]="i">
                <app-ejercicio-card [ejercicio]="ejercicio" />
              </li>
            }
          </ul>
        }
      }
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-5);
    }

    .resumen {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      color: var(--color-text-muted);
    }

    .resumen__contador {
      display: grid;
      place-items: center;
      min-width: 2.75rem;
      height: 2.75rem;
      padding-inline: var(--space-2);
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      font-family: var(--font-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-on-accent);
    }

    .lista {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    @media (width >= 992px) {
      .lista {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-4);
      }
    }
  `,
})
export class EjerciciosListado {
  readonly estado = input.required<EstadoListado>();
  readonly ejercicios = input.required<readonly Ejercicio[]>();
  readonly resumen = input.required<string>();
  readonly textoVacio = input.required<string>();
  readonly reintentar = output();

  /** Huecos del esqueleto mientras cargan los ejercicios. */
  protected readonly huecos = Array.from({ length: 6 });
}
