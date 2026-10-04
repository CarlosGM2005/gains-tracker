import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '@core/notifications/toast.service';
import { FieldError } from '@shared/forms/field-error';
import { refrescarConFormulario } from '@shared/forms/refrescar-con-formulario';
import { GraficaProgreso, type PuntoGrafica } from '@shared/ui/grafica-progreso/grafica-progreso';

import { MENSAJES_PERFIL, REGLAS_PERFIL } from '../domain/perfil.rules';
import { PesoCorporalStore } from '../state/peso-corporal-store';

/**
 * Peso corporal: apuntar el de hoy, el último registrado con su cambio desde el primero y la
 * gráfica de evolución. Va dentro de un bloque de Estadísticas, que pone el título.
 */
@Component({
  selector: 'app-peso-corporal',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, FieldError, GraficaProgreso],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="apuntar" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
      <div class="field apuntar__campo">
        <label class="field__label" for="peso-hoy">Peso de hoy (kg)</label>
        <input
          id="peso-hoy"
          class="input"
          type="number"
          inputmode="decimal"
          step="0.1"
          [min]="reglas.min"
          [max]="reglas.max"
          formControlName="kg"
          aria-describedby="peso-hoy-error"
        />
        <app-field-error [control]="form.controls.kg" [mensajes]="mensajes" idError="peso-hoy-error" />
      </div>
      <button type="submit" class="btn btn--primary apuntar__btn" [disabled]="guardando() || form.invalid">
        {{ guardando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </form>

    @if (store.error()) {
      <p class="nota">No se pudo cargar tu historial de peso.</p>
    } @else if (store.resumen(); as r) {
      <dl class="datos">
        <div>
          <dt>Último · {{ r.actual.dia | date: 'd MMM' }}</dt>
          <dd>{{ r.actual.kg | number: '1.0-1' }} <small>kg</small></dd>
        </div>
        <div>
          <dt>Desde el primero</dt>
          <dd>
            @if (r.variacion === null) {
              —
            } @else {
              {{ r.variacion > 0 ? '+' : '' }}{{ r.variacion | number: '1.0-1' }} <small>kg</small>
            }
          </dd>
        </div>
      </dl>

      @if (puntos().length > 1) {
        <app-grafica-progreso
          [puntos]="puntos()"
          titulo="Evolución del peso corporal"
          columna="Peso corporal (kg)"
          [marcarMaximo]="false"
        />
      } @else {
        <p class="nota">Apunta tu peso otro día y aquí verás su evolución.</p>
      }
    } @else if (!store.cargando()) {
      <p class="nota">Apunta tu peso y aquí verás cómo cambia con el tiempo.</p>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-5);
    }

    .apuntar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .apuntar__campo {
      flex: 1 1 10rem;
      max-width: 16rem;
    }

    /* Alineado con el input, no con la etiqueta. */
    .apuntar__btn {
      margin-top: 1.9rem;
    }

    .datos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
      margin: 0;

      div {
        padding: var(--space-3);
        border-radius: var(--radius-md);
        background: var(--color-surface-2);
      }

      dt {
        font-size: var(--font-size-xs);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-text-muted);
      }

      dd {
        margin: 0;
        font-family: var(--font-display);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        font-variant-numeric: tabular-nums;
      }

      small {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
      }
    }

    .nota {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  `,
})
export class PesoCorporal {
  private readonly toasts = inject(ToastService);

  protected readonly store = inject(PesoCorporalStore);
  protected readonly reglas = REGLAS_PERFIL.peso;
  protected readonly mensajes = MENSAJES_PERFIL.peso;
  protected readonly guardando = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    kg: [
      null as number | null,
      [Validators.required, Validators.min(REGLAS_PERFIL.peso.min), Validators.max(REGLAS_PERFIL.peso.max)],
    ],
  });

  protected readonly puntos = computed<PuntoGrafica[]>(() =>
    this.store.pesos().map((p) => ({ dia: p.dia, valor: p.kg })),
  );

  constructor() {
    refrescarConFormulario(this.form);
  }

  protected async guardar(): Promise<void> {
    const kg = this.form.controls.kg.value;
    if (this.form.invalid || kg === null) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    try {
      await this.store.registrar(kg);
      this.form.reset();
      this.toasts.exito('Peso guardado.');
    } catch {
      this.toasts.error('No se pudo guardar el peso. Inténtalo de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}
