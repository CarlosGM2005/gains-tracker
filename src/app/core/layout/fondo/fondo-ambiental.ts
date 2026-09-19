import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
} from '@angular/core';

/** Cada chispa con su posición, tamaño, duración, retardo negativo (ya en vuelo) y deriva. */
const CHISPAS = Array.from({ length: 16 }, (_, i) => ({
  x: `${(i * 37 + 7) % 100}%`,
  tamano: `${2 + (i % 3)}px`,
  duracion: `${9 + ((i * 7) % 8)}s`,
  retardo: `-${(i * 13) % 17}s`,
  deriva: `${(((i * 11) % 5) - 2) * 12}px`,
}));

/**
 * Ondas sobre un viewBox de 1440 × 800, estirado a toda la pantalla: van repartidas de arriba
 * abajo para que el trazado cruce la página entera, no solo el pie. Empiezan y acaban **fuera**
 * del viewBox (de -80 a 1520): así los extremos los corta el borde de la pantalla y la onda se ve
 * de lado a lado, sin puntas sueltas dentro de la página.
 */
const ONDAS = [
  'M-80 110 C 220 50 470 175 720 110 S 1240 20 1520 85',
  'M-80 255 C 240 185 480 325 720 250 S 1250 165 1520 230',
  'M-80 405 C 300 335 520 455 780 390 S 1230 315 1520 385',
  'M-80 555 C 200 615 460 495 700 550 S 1200 640 1520 525',
  'M-80 700 C 260 635 500 765 760 690 S 1240 605 1520 675',
];

/**
 * Capa decorativa del fondo de la app (brasas, rejilla, ondas, chispas y foco del puntero).
 * Solo movimiento: no lee datos ni afecta al contenido. El `Shell` la pinta una vez y le pasa la
 * sección para que la luz cambie de sitio al navegar.
 */
@Component({
  selector: 'app-fondo-ambiental',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fondo-ambiental.html',
  styleUrl: './fondo-ambiental.scss',
  host: {
    'aria-hidden': 'true',
    '[attr.data-seccion]': 'seccion()',
  },
})
export class FondoAmbiental {
  readonly seccion = input('portada');

  protected readonly chispas = CHISPAS;
  protected readonly ondas = ONDAS;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const documento = inject(DOCUMENT);
    const ventana = documento.defaultView;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!ventana?.matchMedia || ventana.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const foco = host.querySelector<HTMLElement>('.fondo__foco');
      if (!foco) {
        return;
      }

      let frame = 0;
      let x = 0;
      let y = 0;

      // Con ratón el foco persigue al puntero con retardo (la transición del CSS hace el suavizado).
      const alMover = (evento: PointerEvent): void => {
        if (evento.pointerType !== 'mouse') {
          return;
        }
        x = evento.clientX;
        y = evento.clientY;
        host.dataset['puntero'] = 'activo';
        frame ||= ventana.requestAnimationFrame(() => {
          frame = 0;
          foco.style.setProperty('--px', `${x}px`);
          foco.style.setProperty('--py', `${y}px`);
        });
      };

      const alSalir = (): void => {
        delete host.dataset['puntero'];
      };

      // En táctil no hay puntero que seguir: el foco destella donde se toca.
      const alTocar = (evento: PointerEvent): void => {
        if (evento.pointerType === 'mouse' || typeof foco.animate !== 'function') {
          return;
        }
        const posicion = `translate(${evento.clientX}px, ${evento.clientY}px)`;
        foco.animate(
          [
            { transform: `${posicion} scale(0.4)`, opacity: 0 },
            { opacity: 0.55, offset: 0.25 },
            { transform: `${posicion} scale(1.1)`, opacity: 0 },
          ],
          { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      };

      ventana.addEventListener('pointermove', alMover, { passive: true });
      ventana.addEventListener('pointerdown', alTocar, { passive: true });
      ventana.addEventListener('blur', alSalir);
      documento.documentElement.addEventListener('pointerleave', alSalir);

      destroyRef.onDestroy(() => {
        ventana.cancelAnimationFrame(frame);
        ventana.removeEventListener('pointermove', alMover);
        ventana.removeEventListener('pointerdown', alTocar);
        ventana.removeEventListener('blur', alSalir);
        documento.documentElement.removeEventListener('pointerleave', alSalir);
      });
    });
  }
}
