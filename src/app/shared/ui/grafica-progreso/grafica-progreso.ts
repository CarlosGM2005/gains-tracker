import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

/** Un día de la gráfica: peso máximo de un ejercicio, peso corporal… siempre en kilos. */
export interface PuntoGrafica {
  /** `YYYY-MM-DD`. */
  dia: string;
  valor: number;
  /** Solo para la tabla accesible: si algún punto lo trae, la tabla añade su columna. */
  volumen?: number;
}

const ANCHO = 600;
const ALTO = 220;
const MARGEN = { arriba: 18, derecha: 18, abajo: 14, izquierda: 46 };

/**
 * Línea de un valor en kilos por día, en SVG y sin librerías: el peso máximo de un ejercicio o el
 * peso corporal. Para lectores de pantalla, la misma información va en una tabla oculta. Al
 * aparecer (y al cambiar de datos) la línea se dibuja, el área se funde y los puntos saltan al final.
 *
 * Al pasar el puntero (o tocar) sobre un día se marca con una línea vertical y se lee su fecha y su
 * peso sobre el dibujo. El SVG es `aria-hidden`, así que los puntos no son enfocables a propósito:
 * con teclado y con lector de pantalla la información sale de la tabla, que la tiene entera.
 */
@Component({
  selector: 'app-grafica-progreso',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lienzo">
      <!-- El @for de un solo elemento recrea el SVG cuando cambian los datos: así la entrada se repite. -->
      @for (g of [geometria()]; track g) {
        <svg
          class="grafica"
          [attr.viewBox]="'0 0 ' + ancho + ' ' + alto"
          aria-hidden="true"
          focusable="false"
          (pointerleave)="salir($event)"
        >
          @for (linea of g.guias; track linea.y) {
            <line
              class="grafica__guia"
              [attr.x1]="margen.izquierda"
              [attr.x2]="ancho - margen.derecha"
              [attr.y1]="linea.y"
              [attr.y2]="linea.y"
            />
            <text
              class="grafica__eje"
              [attr.x]="margen.izquierda - 8"
              [attr.y]="linea.y + 4"
              text-anchor="end"
            >
              {{ linea.valor | number: '1.0-1' }}
            </text>
          }
          <path class="grafica__area" [attr.d]="g.area" />
          <polyline class="grafica__linea" [attr.points]="g.linea" pathLength="1" />
          @for (p of g.puntos; track p.dia; let i = $index) {
            <circle
              class="grafica__punto"
              [class.grafica__punto--record]="p.record"
              [class.grafica__punto--extremo]="p.extremo"
              [attr.cx]="p.x"
              [attr.cy]="p.y"
              [attr.r]="p.extremo ? 7.5 : 5"
              [style.--i]="i / g.puntos.length"
            />
          }

          @if (seleccion(); as sel) {
            <line
              class="grafica__marca"
              [attr.x1]="sel.x"
              [attr.x2]="sel.x"
              [attr.y1]="margen.arriba"
              [attr.y2]="alto - margen.abajo"
            />
            <circle class="grafica__destacado" [attr.cx]="sel.x" [attr.cy]="sel.y" r="9" />
          }

          <!-- Zonas sensibles, al final para quedar por encima del dibujo. Son más grandes que el
             punto: con el dedo hay que poder acertar sin precisión. -->
          @for (p of g.puntos; track p.dia; let i = $index) {
            <circle
              class="grafica__zona"
              [attr.cx]="p.x"
              [attr.cy]="p.y"
              r="20"
              (pointerenter)="activo.set(i)"
              (pointerdown)="activo.set(i)"
            />
          }
        </svg>
      }

      <!-- El bocadillo va en HTML, no dentro del SVG: así el texto se ve a tamaño real y no
           encogido por la escala del dibujo, y la caja se ajusta sola a lo que mide el contenido.
           Se coloca en porcentajes, que es lo que mantiene el SVG al escalarse. -->
      @if (seleccion(); as sel) {
        <div
          class="bocadillo"
          [class.bocadillo--inicio]="sel.lado === 'inicio'"
          [class.bocadillo--fin]="sel.lado === 'fin'"
          [class.bocadillo--debajo]="sel.debajo"
          [style.left.%]="sel.porcentajeX"
          [style.top.%]="sel.porcentajeY"
        >
          <span class="bocadillo__fecha">{{ sel.dia | date: 'd MMM y' }}</span>
          <span class="bocadillo__peso">{{ sel.peso | number: '1.0-2' }} <small>kg</small></span>
        </div>
      }
    </div>

    <table class="visually-hidden">
      <caption>{{ titulo() }}</caption>
      <thead>
        <tr>
          <th scope="col">Día</th>
          <th scope="col">{{ columna() }}</th>
          @if (conVolumen()) {
            <th scope="col">Volumen (kg)</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (p of puntos(); track p.dia) {
          <tr>
            <td>{{ p.dia | date: 'longDate' }}</td>
            <td>{{ p.valor }}</td>
            @if (conVolumen()) {
              <td>{{ p.volumen }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: block;
    }

    .lienzo {
      position: relative;
    }

    .grafica {
      display: block;
      width: 100%;
      height: auto;
      /* Nada debe pintarse fuera del dibujo: lo que se salga, se recorta, y así la gráfica no puede
         empujar la página a lo ancho. */
      overflow: hidden;
      /* Sin esto, un doble toque en el móvil hace zoom sobre la gráfica y la página se queda
         desplazada. El pellizco para ampliar sigue funcionando. */
      touch-action: manipulation;
    }

    .grafica__guia {
      stroke: var(--color-border);
      stroke-dasharray: 4 6;
    }

    /* El tamaño está en unidades del viewBox, no en píxeles de pantalla: el SVG se escala al
       ancho disponible, así que 18 aquí se leen como ~10 px en un móvil de 375. */
    .grafica__eje {
      font-size: 18px;
      font-variant-numeric: tabular-nums;
      fill: var(--color-text-muted);
    }

    /* Entrada inspirada en las gráficas de Bklit UI. Todo espera al revelado del bloque (--entrada). */
    .grafica__area {
      fill: var(--color-accent-soft);
      animation: rise-in 600ms var(--easing-out) 300ms both;
      animation-play-state: var(--entrada, running);
    }

    /* pathLength="1": el trazo mide 1 y se dibuja llevando el desplazamiento de 1 a 0. */
    .grafica__linea {
      fill: none;
      stroke: var(--color-accent);
      stroke-dasharray: 1;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 3;
      animation: trazar 900ms var(--easing-out) both;
      animation-play-state: var(--entrada, running);
    }

    /* Cada punto salta cuando la línea llega a él (--i = posición de 0 a 1). */
    .grafica__punto {
      fill: var(--color-bg);
      stroke: var(--color-accent);
      stroke-width: 3;
      transform-box: fill-box;
      transform-origin: center;
      animation: saltar 360ms var(--easing-spring) both;
      animation-delay: calc(150ms + var(--i, 0) * 700ms);
      animation-play-state: var(--entrada, running);
    }

    @keyframes trazar {
      from {
        stroke-dashoffset: 1;
      }

      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes saltar {
      from {
        transform: scale(0);
      }
    }

    .grafica__punto--record {
      fill: var(--color-accent);
    }

    /* Primer y último día: anillo más grueso, para encontrarlos de un vistazo en la línea. */
    .grafica__punto--extremo {
      stroke-width: 3.5;
    }

    /* Día señalado: línea vertical, punto relleno y la lectura encima. */
    .grafica__marca {
      stroke: var(--color-accent);
      stroke-width: 1.5;
      stroke-dasharray: 3 5;
      opacity: 0.55;
      pointer-events: none;
    }

    .grafica__destacado {
      fill: var(--color-accent);
      stroke: var(--color-bg);
      stroke-width: 3;
      pointer-events: none;
    }

    /* Bocadillo del día señalado. Por defecto sale centrado encima del punto; cerca de un borde se
       ancla por ese lado y, si el punto está muy arriba, se va debajo. Así nunca se sale. */
    .bocadillo {
      position: absolute;
      z-index: 1;
      display: grid;
      gap: 2px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface-2);
      box-shadow: var(--shadow-card);
      white-space: nowrap;
      pointer-events: none;
      transform: translate(-50%, calc(-100% - 14px));
      animation: bocadillo-entra 160ms var(--easing-out);
    }

    @keyframes bocadillo-entra {
      from {
        opacity: 0;
      }
    }

    .bocadillo--inicio {
      transform: translate(-14px, calc(-100% - 14px));
    }

    .bocadillo--fin {
      transform: translate(calc(-100% + 14px), calc(-100% - 14px));
    }

    .bocadillo--debajo {
      transform: translate(-50%, 14px);
    }

    .bocadillo--debajo.bocadillo--inicio {
      transform: translate(-14px, 14px);
    }

    .bocadillo--debajo.bocadillo--fin {
      transform: translate(calc(-100% + 14px), 14px);
    }

    /* La punta es un cuadrado girado 45°, con solo dos lados de borde: encaja con la caja sin que
       se vea la línea por dentro. */
    .bocadillo::after {
      position: absolute;
      bottom: -5px;
      left: calc(50% - 4.5px);
      width: 9px;
      height: 9px;
      border-right: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface-2);
      content: '';
      transform: rotate(45deg);
    }

    .bocadillo--inicio::after {
      left: 9.5px;
    }

    .bocadillo--fin::after {
      left: auto;
      right: 9.5px;
    }

    .bocadillo--debajo::after {
      top: -5px;
      bottom: auto;
      border-right: 0;
      border-bottom: 0;
      border-top: 1px solid var(--color-border);
      border-left: 1px solid var(--color-border);
    }

    .bocadillo__fecha {
      font-size: var(--font-size-xs);
      letter-spacing: var(--letter-spacing-label);
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .bocadillo__peso {
      font-family: var(--font-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      line-height: 1;

      small {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
      }
    }

    .grafica__zona {
      fill: transparent;
      cursor: pointer;
    }
  `,
})
export class GraficaProgreso {
  readonly puntos = input.required<readonly PuntoGrafica[]>();
  /** Descripción de la tabla accesible (p. ej. "Progreso de Press de banca"). */
  readonly titulo = input.required<string>();
  /** Cabecera de la columna del valor en la tabla accesible. */
  readonly columna = input('Peso máximo (kg)');
  /** Rellena el punto del valor más alto: es el récord en un ejercicio, no en el peso corporal. */
  readonly marcarMaximo = input(true);

  protected readonly conVolumen = computed(() => this.puntos().some((p) => p.volumen !== undefined));

  /** Día señalado con el puntero. Vuelve a `null` en cuanto cambian los datos. */
  protected readonly activo = linkedSignal<readonly PuntoGrafica[], number | null>({
    source: this.puntos,
    computation: () => null,
  });

  /**
   * Con ratón, la lectura se va al salir de la gráfica. Con el dedo no: soltar dispara
   * `pointerleave` al instante y la lectura desaparecería antes de poder leerla, así que se queda
   * hasta que se toque otro día o cambie el ejercicio.
   */
  protected salir(evento: PointerEvent): void {
    if (evento.pointerType !== 'touch') {
      this.activo.set(null);
    }
  }

  protected readonly ancho = ANCHO;
  protected readonly alto = ALTO;
  protected readonly margen = MARGEN;

  /**
   * Punto señalado, ya resuelto para pintarlo. La posición del bocadillo va en porcentajes porque
   * es lo que se mantiene cuando el SVG se escala al ancho disponible. Cerca de un borde se ancla
   * por ese lado, y si el punto está muy arriba el bocadillo se va debajo: así nunca se sale.
   */
  protected readonly seleccion = computed(() => {
    const indice = this.activo();
    if (indice === null) return null;
    const punto = this.geometria().puntos[indice];
    if (!punto) return null;

    const porcentajeX = (punto.x / ANCHO) * 100;
    const porcentajeY = (punto.y / ALTO) * 100;
    return {
      ...punto,
      porcentajeX,
      porcentajeY,
      lado: porcentajeX < 22 ? 'inicio' : porcentajeX > 78 ? 'fin' : 'centro',
      debajo: porcentajeY < 34,
    };
  });

  protected readonly geometria = computed(() => {
    const puntos = this.puntos();
    const pesos = puntos.map((p) => p.valor);
    const maximo = Math.max(...pesos, 0);
    const minimo = Math.min(...pesos, maximo);
    // Margen vertical para que la línea no toque los bordes; con un solo valor, un rango fijo.
    const holgura = maximo === minimo ? Math.max(5, maximo * 0.1) : (maximo - minimo) * 0.15;
    const techo = maximo + holgura;
    const suelo = Math.max(0, minimo - holgura);

    const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
    const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
    const x = (i: number) => MARGEN.izquierda + (puntos.length === 1 ? anchoUtil / 2 : (anchoUtil * i) / (puntos.length - 1));
    const y = (valor: number) => MARGEN.arriba + altoUtil * (1 - (valor - suelo) / (techo - suelo || 1));

    const coordenadas = puntos.map((p, i) => ({
      dia: p.dia,
      x: redondear(x(i)),
      y: redondear(y(p.valor)),
      peso: p.valor,
      record: this.marcarMaximo() && p.valor === maximo,
      // El primer y el último día llevan anillo: son los extremos que compara la tira de hitos.
      extremo: i === 0 || i === puntos.length - 1,
    }));
    const linea = coordenadas.map((c) => `${c.x},${c.y}`).join(' ');
    const base = ALTO - MARGEN.abajo;
    const primero = coordenadas[0];
    const ultimo = coordenadas.at(-1);
    const area = primero && ultimo ? `M${primero.x},${base} L${linea.replaceAll(' ', ' L')} L${ultimo.x},${base} Z` : '';

    return {
      puntos: coordenadas,
      linea,
      area,
      guias: [techo, (techo + suelo) / 2, suelo].map((valor) => ({ valor, y: redondear(y(valor)) })),
    };
  });
}

function redondear(n: number): number {
  return Math.round(n * 10) / 10;
}
