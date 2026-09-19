import { DOCUMENT, formatNumber } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  LOCALE_ID,
  signal,
  untracked,
} from '@angular/core';

/** Duración de la cuenta. */
const DURACION_MS = 800;

/**
 * Número que cuenta desde el valor anterior (0 la primera vez) hasta el nuevo, con salida enérgica.
 * Los lectores de pantalla solo leen el valor final. Con prefers-reduced-motion, o sin
 * requestAnimationFrame (tests), muestra el valor directamente.
 */
@Component({
  selector: 'app-contador',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span aria-hidden="true">{{ texto() }}</span><span class="visually-hidden">{{ textoFinal() }}</span>`,
  styles: `
    :host {
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class Contador {
  private readonly locale = inject(LOCALE_ID);

  readonly valor = input.required<number>();
  /** Formato de `formatNumber` (p. ej. `'1.0-2'`). */
  readonly formato = input('1.0-0');

  private readonly mostrado = signal(0);
  protected readonly texto = computed(() => formatNumber(this.mostrado(), this.locale, this.formato()));
  protected readonly textoFinal = computed(() => formatNumber(this.valor(), this.locale, this.formato()));

  constructor() {
    const ventana = inject(DOCUMENT).defaultView;
    let frame = 0;
    inject(DestroyRef).onDestroy(() => ventana?.cancelAnimationFrame?.(frame));

    effect(() => {
      const destino = this.valor();
      untracked(() => {
        ventana?.cancelAnimationFrame?.(frame);
        const origen = this.mostrado();
        if (
          !ventana ||
          typeof ventana.requestAnimationFrame !== 'function' ||
          typeof ventana.matchMedia !== 'function' ||
          ventana.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          origen === destino
        ) {
          this.mostrado.set(destino);
          return;
        }
        const inicio = ventana.performance.now();
        const paso = (ahora: number): void => {
          const progreso = Math.min(1, (ahora - inicio) / DURACION_MS);
          // Salida exponencial: arranca rápido y se asienta al final.
          const suavizado = progreso === 1 ? 1 : 1 - 2 ** (-10 * progreso);
          this.mostrado.set(origen + (destino - origen) * suavizado);
          if (progreso < 1) {
            frame = ventana.requestAnimationFrame(paso);
          }
        };
        frame = ventana.requestAnimationFrame(paso);
      });
    });
  }
}
