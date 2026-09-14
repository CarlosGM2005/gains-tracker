import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Revela el elemento al entrar en pantalla (fade + subida). Los estilos están en
 * `src/styles/_motion.scss`. Sin IntersectionObserver (navegadores antiguos, tests) se ve sin animar.
 */
@Directive({
  selector: '[appReveal]',
})
export class Reveal {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const ventana = inject(DOCUMENT).defaultView;
    const destroyRef = inject(DestroyRef);

    if (!ventana || !('IntersectionObserver' in ventana)) {
      return;
    }
    // Se oculta antes del primer pintado para evitar un parpadeo.
    el.dataset['reveal'] = 'pending';

    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((entrada) => entrada.isIntersecting)) {
            el.dataset['reveal'] = 'visible';
            observer.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
