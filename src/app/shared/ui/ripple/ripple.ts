import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject } from '@angular/core';

/** Duración y curva de la onda (--easing-out de los tokens). */
const DURACION_MS = 450;
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Onda de pulsación: al tocar o hacer clic, un círculo del acento crece desde el punto exacto y se
 * desvanece. Da respuesta táctil donde no hay hover. El anfitrión necesita `position: relative` (o
 * absoluta) y `overflow: hidden`; el estilo `.ripple` está en `src/styles/_motion.scss`.
 * No hace nada con prefers-reduced-motion ni sin Web Animations API (tests con jsdom).
 */
@Directive({
  selector: '[appRipple]',
  host: { '(pointerdown)': 'onda($event)' },
})
export class Ripple {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);

  protected onda(evento: PointerEvent): void {
    const ventana = this.document.defaultView;
    if (evento.button !== 0 || !ventana || typeof this.el.animate !== 'function') {
      return;
    }
    if (typeof ventana.matchMedia !== 'function' || ventana.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const caja = this.el.getBoundingClientRect();
    const x = evento.clientX - caja.left;
    const y = evento.clientY - caja.top;
    // Radio hasta la esquina más lejana: la onda siempre cubre todo el anfitrión.
    const radio = Math.hypot(Math.max(x, caja.width - x), Math.max(y, caja.height - y));

    const onda = this.document.createElement('span');
    onda.className = 'ripple';
    onda.style.width = `${radio * 2}px`;
    onda.style.height = `${radio * 2}px`;
    onda.style.left = `${x - radio}px`;
    onda.style.top = `${y - radio}px`;
    this.el.append(onda);

    const animacion = onda.animate(
      [
        { transform: 'scale(0)', opacity: 0.35 },
        { transform: 'scale(1)', opacity: 0 },
      ],
      { duration: DURACION_MS, easing: EASING, fill: 'forwards' },
    );
    const quitar = (): void => onda.remove();
    animacion.finished.then(quitar, quitar);
  }
}
