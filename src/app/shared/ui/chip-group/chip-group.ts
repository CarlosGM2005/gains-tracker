import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

export interface ChipOption<T extends string = string> {
  valor: T;
  etiqueta: string;
}

/**
 * Selector de una opción en forma de chips con scroll horizontal (músculos).
 * Botones con `aria-pressed`: una sola opción activa; se recorren con Tab.
 * Una pastilla naranja se desliza bajo el chip activo al cambiar de opción (idea de los layouts
 * compartidos de Motion). Sin JS o antes de medir, el chip activo se pinta solo con su borde.
 */
@Component({
  selector: 'app-chip-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #grupo class="chips" role="group" [attr.aria-label]="etiqueta()">
      <span #indicador class="chips__indicador" aria-hidden="true"></span>
      @for (opcion of opciones(); track opcion.valor) {
        <button
          type="button"
          class="chip"
          [class.chip--activo]="opcion.valor === seleccionado()"
          [attr.aria-pressed]="opcion.valor === seleccionado()"
          (click)="seleccionado.set(opcion.valor)"
        >
          {{ opcion.etiqueta }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    .chips {
      position: relative;
      display: flex;
      gap: var(--space-2);
      margin-inline: calc(var(--page-gutter) * -1);
      padding: var(--space-2) var(--page-gutter);
      overflow-x: auto;
      scroll-snap-type: x proximity;
      /* Al saltar de un chip a otro queda a la altura del margen de la página, no pegado al borde. */
      scroll-padding-inline: var(--page-gutter);
      scrollbar-width: none;
      /* Los extremos se desvanecen: dice sin palabras que la tira sigue hacia los lados. El tramo
         que se difumina es justo el margen de la página, así que un chip en reposo nunca se apaga. */
      mask-image: linear-gradient(
        90deg,
        transparent 0,
        #000 var(--page-gutter),
        #000 calc(100% - var(--page-gutter)),
        transparent 100%
      );
    }

    /* Pastilla que marca el chip activo. La posición y el ancho los pone el código tras medir. */
    .chips__indicador {
      position: absolute;
      top: var(--space-2);
      left: 0;
      width: 0;
      height: var(--tap-target);
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      /* La pastilla se despega del fondo con su propia luz, como el botón principal. */
      box-shadow: 0 8px 20px -8px var(--color-accent-glow);
      opacity: 0;
      pointer-events: none;
    }

    .chips__indicador--listo {
      opacity: 1;
      transition:
        transform var(--duration-slow) var(--easing-spring),
        width var(--duration-slow) var(--easing-spring);
    }

    .chip {
      position: relative;
      flex-shrink: 0;
      min-height: var(--tap-target);
      padding: 0 var(--space-5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      /* Con fondo propio se leen como controles y no como texto suelto sobre el fondo. */
      background: var(--color-surface);
      white-space: nowrap;
      font-family: var(--font-display);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--letter-spacing-label);
      text-transform: uppercase;
      color: var(--color-text-muted);
      scroll-snap-align: start;
      transition:
        background-color var(--duration-base) var(--easing-standard),
        color var(--duration-base) var(--easing-standard),
        transform var(--duration-fast) var(--easing-standard);
    }

    .chip:active {
      transform: scale(0.95);
    }

    /* El activo se queda sin fondo propio: el color lo pone la pastilla que va detrás. Con fondo
       opaco la taparía y solo asomaría por el borde, con el texto negro sobre un fondo oscuro. */
    .chip--activo {
      border-color: transparent;
      background: transparent;
      color: var(--color-on-accent);
    }

    /* Hasta que la pastilla está colocada, el chip activo lleva su propio fondo. */
    .chips:not(:has(.chips__indicador--listo)) .chip--activo {
      background: var(--color-accent);
    }

    @media (hover: hover) {
      .chip:not(.chip--activo):hover {
        border-color: var(--color-accent);
        color: var(--color-text);
      }
    }
  `,
})
export class ChipGroup<T extends string = string> {
  private readonly grupo = viewChild.required<ElementRef<HTMLElement>>('grupo');
  private readonly indicador = viewChild.required<ElementRef<HTMLElement>>('indicador');

  readonly opciones = input.required<readonly ChipOption<T>[]>();
  readonly seleccionado = model.required<T>();
  /** Nombre accesible del grupo (p. ej. "Músculo"). */
  readonly etiqueta = input.required<string>();

  private readonly movimientoReducido: boolean;

  constructor() {
    const ventana = inject(DOCUMENT).defaultView;
    this.movimientoReducido = ventana?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    afterRenderEffect({
      earlyRead: () => {
        // Se leen para que el efecto se repita al cambiar la opción o la lista.
        this.seleccionado();
        this.opciones();
        return this.medir();
      },
      write: (medida) => {
        this.colocar(medida());
        this.asegurarVisible();
      },
    });

    // Las medidas cambian al cargar la fuente o al girar el móvil: se recoloca sin animar.
    if (ventana && 'ResizeObserver' in ventana) {
      const observador = new ResizeObserver(() => this.colocar(this.medir(), false));
      afterRenderEffect(() => observador.observe(this.grupo().nativeElement));
      inject(DestroyRef).onDestroy(() => observador.disconnect());
    }
  }

  /**
   * Si el chip activo queda fuera de la parte visible de la tira, la desplaza lo justo para
   * enseñarlo. Al entrar en una página con un músculo ya elegido, el chip podía estar escondido a
   * la derecha. Se mueve el `scrollLeft` de la tira, no `scrollIntoView`, que además arrastraría
   * la página en vertical.
   */
  private asegurarVisible(): void {
    const tira = this.grupo().nativeElement;
    const activo = tira.querySelector<HTMLElement>('.chip--activo');
    if (!activo) return;

    const margen = 16;
    const inicio = activo.offsetLeft - margen;
    const fin = activo.offsetLeft + activo.offsetWidth + margen;
    if (inicio >= tira.scrollLeft && fin <= tira.scrollLeft + tira.clientWidth) {
      return;
    }

    const destino = inicio < tira.scrollLeft ? inicio : fin - tira.clientWidth;
    tira.scrollTo({ left: Math.max(0, destino), behavior: this.movimientoReducido ? 'auto' : 'smooth' });
  }

  private medir(): { x: number; ancho: number } | null {
    const activo = this.grupo().nativeElement.querySelector<HTMLElement>('.chip--activo');
    return activo ? { x: activo.offsetLeft, ancho: activo.offsetWidth } : null;
  }

  private colocar(medida: { x: number; ancho: number } | null, animar = true): void {
    const indicador = this.indicador().nativeElement;
    if (!medida) {
      indicador.classList.remove('chips__indicador--listo');
      return;
    }
    // La primera colocación (y los reajustes) van sin transición: solo se desliza al cambiar.
    const yaColocado = indicador.classList.contains('chips__indicador--listo');
    if (!animar || !yaColocado) {
      indicador.style.transition = 'none';
    }
    indicador.style.width = `${medida.ancho}px`;
    indicador.style.transform = `translateX(${medida.x}px)`;
    if (!animar || !yaColocado) {
      // Fuerza el cálculo de estilos para que la vuelta de la transición no anime este salto.
      indicador.getBoundingClientRect();
      indicador.style.transition = '';
    }
    indicador.classList.add('chips__indicador--listo');
  }
}
