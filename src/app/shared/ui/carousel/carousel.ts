import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  type ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

/** Contexto de la plantilla de cada diapositiva: `let-item` y `let-i="index"`. */
export interface CarouselContexto<T> {
  $implicit: T;
  index: number;
}

/**
 * Carrusel con scroll-snap nativo (se puede arrastrar con el dedo) y autoplay. Cada diapositiva se
 * pinta con la `<ng-template>` que se proyecta dentro:
 *
 *   <app-carousel [items]="dias" etiqueta="Rutina">
 *     <ng-template let-dia let-i="index">…</ng-template>
 *   </app-carousel>
 *
 * El autoplay se pausa con hover, foco o toque, cuando la pestaña está oculta y no arranca
 * con prefers-reduced-motion.
 */
@Component({
  selector: 'app-carousel',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  private readonly document = inject(DOCUMENT);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly items = input.required<readonly unknown[]>();
  /** Diapositiva con la que empieza (p. ej. el día de hoy). */
  readonly inicial = input(0);
  protected readonly plantilla = contentChild.required<TemplateRef<CarouselContexto<unknown>>>(TemplateRef);
  /** Nombre accesible del carrusel. */
  readonly etiqueta = input.required<string>();
  readonly intervaloMs = input(5000);

  protected readonly activo = signal(0);
  private pausado = false;
  private movimientoReducido = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const inicial = this.inicial();
      if (inicial > 0 && inicial < this.items().length) {
        const el = this.track().nativeElement;
        el.scrollLeft = inicial * el.clientWidth;
        this.activo.set(inicial);
      }

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
    const total = this.items().length;
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
