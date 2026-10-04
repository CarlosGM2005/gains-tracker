import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { type NumeroNivelRacha } from '../domain/estadisticas';

/** Formas de la llama sobre una rejilla de 64 × 80 con la base en y = 76. */
const FORMAS = {
  /** Silueta: punta inclinada a la derecha y una lengua menor a la izquierda. */
  exterior:
    'M32 2C35 14 46 22 50 35C54 48 51 63 42 71C38 75 35 76 32 76C29 76 26 75 22 71C13 63 10 50 14 39' +
    'C16 33 20 29 22 22C24 29 27 32 29 33C28 22 29 11 32 2Z',
  nucleo:
    'M33 26C35 36 43 42 44 52C45 62 40 70 32 71C24 70 20 63 21 55C22 49 25 45 27 40C28 45 30 47 31 47' +
    'C30 40 31 33 33 26Z',
  /** Corazón de la llama: blanco en Fragua, azul en Llama azul. Con forma de llama, no de gota. */
  corazon:
    'M33 40C34 48 40 53 40 60C40 66 36 70 32 70C28 70 24 66 24 61C24 56 27 53 28 49C29 52 30 54 31 54' +
    'C30 49 31 45 33 40Z',
  /** Punto blanco dentro del corazón azul. */
  centro:
    'M32.5 55C33 59 36 61 36 65C36 68 34 69.5 32 69.5C30 69.5 28 68 28 65.5C28 63 30 61 30.5 59' +
    'C31 60 31.5 60.5 32 60C31.6 58 31.8 56.5 32.5 55Z',
  /** Lengua lateral en coordenadas propias (16 × 30): el grupo que la envuelve la coloca y la inclina. */
  lengua: 'M8 0C10 8 16 13 16 21C16 27 12 30 8 30C4 30 0 27 0 21C0 14 6 9 8 0Z',
} as const;

interface Chispa {
  x: number;
  y: number;
  r: number;
  /** Desvío lateral al subir, en unidades de la rejilla. */
  deriva: number;
  retardo: number;
}

/** Chispas que suben desde la punta: dos en Hoguera y tres desde Fragua. */
const CHISPAS: readonly Chispa[] = [
  { x: 25, y: 16, r: 1.6, deriva: -5, retardo: 0 },
  { x: 40, y: 14, r: 1.3, deriva: 4, retardo: 700 },
  { x: 33, y: 10, r: 1.1, deriva: -2, retardo: 1300 },
];

/**
 * Llama de la racha de días seguidos. Crece y se calienta con el nivel (`nivelRacha`): contorno
 * apagado sin racha, Chispa, Llama con núcleo ámbar, Hoguera con lenguas y chispas, Fragua con
 * corazón blanco y Llama azul. Si hoy todavía no se ha entrenado queda en brasas: quieta, más baja
 * y sin color, hasta que se registre una serie y vuelva a arder.
 *
 * Es decorativa (`aria-hidden`): el nivel y el estado los dice siempre el texto que la acompaña.
 */
@Component({
  selector: 'app-llama-racha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './llama-racha.html',
  styleUrl: './llama-racha.scss',
  host: {
    class: 'llama',
    '[attr.data-nivel]': 'nivel()',
    '[class.llama--viva]': 'nivel() > 0 && encendida()',
    '[class.llama--brasas]': 'nivel() > 0 && !encendida()',
    '[class.llama--grande]': "tamano() === 'grande'",
  },
})
export class LlamaRacha {
  readonly nivel = input.required<NumeroNivelRacha>();
  /** Hoy ya hay alguna serie. Si no, la llama queda en brasas. */
  readonly encendida = input(false);
  /** `grande` en Estadísticas, con chispas y entrada; `compacta` al lado de un texto. */
  readonly tamano = input<'grande' | 'compacta'>('compacta');

  protected readonly formas = FORMAS;
  protected readonly chispas = computed(() => CHISPAS.slice(0, this.nivel() >= 4 ? 3 : 2));
}
