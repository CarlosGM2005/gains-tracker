import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Contador } from '@shared/ui/contador/contador';

import { NIVELES_RACHA, nivelRacha, type Racha } from '../domain/estadisticas';
import { LlamaRacha } from './llama-racha';

/**
 * Racha de días seguidos entrenando: la llama de su nivel, la cifra, cuánto falta para el siguiente
 * nivel, qué hacer para no perderla y la mejor racha.
 */
@Component({
  selector: 'app-racha-dias',
  imports: [Contador, LlamaRacha],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './racha-dias.html',
  styleUrl: './racha-dias.scss',
})
export class RachaDias {
  readonly racha = input.required<Racha>();

  protected readonly nivel = computed(() => nivelRacha(this.racha().actual));
  protected readonly totalNiveles = NIVELES_RACHA.length;

  protected readonly mensaje = computed(() => {
    const { actual, mejor, entrenadoHoy } = this.racha();
    if (actual === 0) {
      return 'Registra una serie hoy para encender la llama.';
    }
    if (!entrenadoHoy) {
      return 'Tu llama está en brasas: entrena hoy para que no se apague.';
    }
    return actual >= mejor
      ? '¡Es tu mejor racha! Sigue así.'
      : `Te faltan ${mejor - actual + 1} para batir tu mejor marca.`;
  });
}
