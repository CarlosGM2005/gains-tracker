import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Contador } from '@shared/ui/contador/contador';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { Reveal } from '@shared/ui/reveal/reveal';
import { Spinner } from '@shared/ui/spinner/spinner';

import { actividadSemanal, progresoEjercicio, resumenGlobal } from '../domain/estadisticas';
import { type RegistroEjercicio } from '../domain/registro.model';
import { RegistrosStore } from '../state/registros-store';
import { GraficaProgreso } from '../ui/grafica-progreso';

const SEMANAS = 8;

/** Resumen de todos los registros, progreso por ejercicio y actividad de las últimas semanas. */
@Component({
  selector: 'app-estadisticas-page',
  imports: [RouterLink, DatePipe, DecimalPipe, PageHeader, EmptyState, Spinner, Reveal, Contador, GraficaProgreso],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './estadisticas-page.html',
  styleUrl: './estadisticas-page.scss',
})
export class EstadisticasPage {
  protected readonly store = inject(RegistrosStore);

  protected readonly resumen = computed(() => resumenGlobal(this.store.registros()));
  protected readonly semanas = computed(() => actividadSemanal(this.store.registros(), new Date(), SEMANAS));
  protected readonly diasSemanas = computed(() => this.semanas().reduce((total, s) => total + s.dias, 0));

  /**
   * Ejercicio elegido en el selector. Por defecto, el entrenado más recientemente; si llega un cambio
   * en tiempo real, se mantiene la elección mientras ese ejercicio siga existiendo.
   */
  protected readonly ejercicioId = linkedSignal<readonly RegistroEjercicio[], string | null>({
    source: () => this.store.registros(),
    computation: (registros, previo) =>
      previo?.value && registros.some((r) => r.ejercicioId === previo.value)
        ? previo.value
        : (registros[0]?.ejercicioId ?? null),
  });
  protected readonly registroElegido = computed(
    () => this.store.registros().find((r) => r.ejercicioId === this.ejercicioId()) ?? null,
  );
  protected readonly progreso = computed(() => {
    const registro = this.registroElegido();
    return registro ? progresoEjercicio(registro) : null;
  });
}
