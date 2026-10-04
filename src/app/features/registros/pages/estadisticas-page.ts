import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PesoCorporal } from '@features/perfil/public-api';
import { Contador } from '@shared/ui/contador/contador';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { GraficaProgreso, type PuntoGrafica } from '@shared/ui/grafica-progreso/grafica-progreso';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { Reveal } from '@shared/ui/reveal/reveal';
import { Spinner } from '@shared/ui/spinner/spinner';

import {
  actividadSemanal,
  mejorSerie,
  progresoEjercicio,
  rachaDias,
  recordsPersonales,
  resumenGlobal,
  unaRmEstimada,
} from '../domain/estadisticas';
import { type RegistroEjercicio } from '../domain/registro.model';
import { RegistrosStore } from '../state/registros-store';
import { RachaDias } from '../ui/racha-dias';
import { RecordsPersonales } from '../ui/records-personales';

const SEMANAS = 8;

/**
 * Resumen de todos los registros, racha, récords personales, progreso por ejercicio, actividad de
 * las últimas semanas y peso corporal.
 */
@Component({
  selector: 'app-estadisticas-page',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    PageHeader,
    EmptyState,
    Spinner,
    Reveal,
    Contador,
    GraficaProgreso,
    RachaDias,
    RecordsPersonales,
    PesoCorporal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './estadisticas-page.html',
  styleUrl: './estadisticas-page.scss',
})
export class EstadisticasPage {
  protected readonly store = inject(RegistrosStore);

  protected readonly resumen = computed(() => resumenGlobal(this.store.registros()));
  protected readonly semanas = computed(() => actividadSemanal(this.store.registros(), new Date(), SEMANAS));
  protected readonly diasSemanas = computed(() => this.semanas().reduce((total, s) => total + s.dias, 0));
  protected readonly racha = computed(() => rachaDias(this.store.registros(), new Date()));
  protected readonly records = computed(() => recordsPersonales(this.store.registros()));

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
  /** Mejor serie del ejercicio elegido, con su repetición máxima estimada. */
  protected readonly mejor = computed(() => {
    const serie = mejorSerie(this.registroElegido()?.series ?? []);
    return serie
      ? { ...serie, unaRm: serie.peso > 0 ? unaRmEstimada(serie.peso, serie.repeticiones) : null }
      : null;
  });
  protected readonly puntosGrafica = computed<PuntoGrafica[]>(() =>
    (this.progreso()?.puntos ?? []).map((p) => ({ dia: p.dia, valor: p.pesoMax, volumen: p.volumen })),
  );

  /**
   * Primer y último día del ejercicio elegido, los dos extremos que compara la gráfica.
   * `null` cuando solo hay un día: entonces no hay nada que comparar.
   */
  protected readonly extremos = computed(() => {
    const puntos = this.progreso()?.puntos ?? [];
    const primero = puntos[0];
    const ultimo = puntos.at(-1);
    return primero && ultimo && primero !== ultimo ? { primero, ultimo } : null;
  });
}
