import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

export interface CarouselSlide {
  /** Imagen para ≥ 768 px. */
  srcEscritorio: string;
  /** Imagen para < 768 px. */
  srcMovil: string;
  alt: string;
}

/**
 * Carrusel con scroll-snap nativo (se puede arrastrar con el dedo) y autoplay.
 * El autoplay se pausa con hover, foco o toque, cuando la pestaña está oculta y no arranca
 * con prefers-reduced-motion.
 */
@Component({
  selector: 'app-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  private readonly document = inject(DOCUMENT);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly slides = input.required<readonly CarouselSlide[]>();
  /** Nombre accesible del carrusel. */
  readonly etiqueta = input.required<string>();
  readonly intervaloMs = input(5000);

  protected readonly activo = signal(0);
  private pausado = false;
  private movimientoReducido = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const ventana = this.document.defaultView;
      // Sin matchMedia (entornos de test) se trata como movimiento reducido: sin autoplay.
      const consulta =
        ventana && typeof ventana.matchMedia === 'function'
          ? ventana.matchMedia('(prefers-reduced-motion: reduce)')
          : null;
      this.movimientoReducido = consulta?.matches ?? true;
      if (!ventana || this.movimientoReducido) {
        return;
      }
      const id = ventana.setInterval(() => {
        if (!this.pausado && this.document.visibilityState === 'visible') {
          this.ir(this.activo() + 1);
        }
      }, this.intervaloMs());
      destroyRef.onDestroy(() => ventana.clearInterval(id));
    });
  }

  protected ir(indice: number): void {
    const total = this.slides().length;
    if (total === 0) {
      return;
    }
    const destino = (indice + total) % total;
    const el = this.track().nativeElement;
    el.scrollTo({ left: destino * el.clientWidth, behavior: this.movimientoReducido ? 'auto' : 'smooth' });
    this.activo.set(destino);
  }

  protected alHacerScroll(): void {
    const el = this.track().nativeElement;
    if (el.clientWidth > 0) {
      this.activo.set(Math.round(el.scrollLeft / el.clientWidth));
    }
  }

  protected pausar(valor: boolean): void {
    this.pausado = valor;
  }
}
