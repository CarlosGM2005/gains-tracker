import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { type PuntoProgreso } from '../domain/estadisticas';

const ANCHO = 600;
const ALTO = 220;
const MARGEN = { arriba: 16, derecha: 16, abajo: 28, izquierda: 44 };

/**
 * Línea del peso máximo por día, en SVG y sin librerías. Para lectores de pantalla, la misma
 * información va en una tabla oculta. Al aparecer (y al cambiar de ejercicio) la línea se dibuja,
 * el área se funde y los puntos saltan al final.
 */
@Component({
  selector: 'app-grafica-progreso',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- El @for de un solo elemento recrea el SVG cuando cambian los datos: así la entrada se repite. -->
    @for (g of [geometria()]; track g) {
      <svg class="grafica" [attr.viewBox]="'0 0 ' + ancho + ' ' + alto" aria-hidden="true" focusable="false">
        @for (linea of g.guias; track linea.y) {
          <line class="grafica__guia" [attr.x1]="margen.izquierda" [attr.x2]="ancho - margen.derecha" [attr.y1]="linea.y" [attr.y2]="linea.y" />
          <text class="grafica__eje" [attr.x]="margen.izquierda - 8" [attr.y]="linea.y + 4" text-anchor="end">{{ linea.valor | number: '1.0-1' }}</text>
        }
        <path class="grafica__area" [attr.d]="g.area" />
        <polyline class="grafica__linea" [attr.points]="g.linea" pathLength="1" />
        @for (p of g.puntos; track p.dia; let i = $index) {
          <circle
            class="grafica__punto"
            [class.grafica__punto--record]="p.record"
            [attr.cx]="p.x"
            [attr.cy]="p.y"
            r="5"
            [style.--i]="i / g.puntos.length"
          />
        }
        @if (g.puntos[0]; as primero) {
          <text class="grafica__eje" [attr.x]="primero.x" [attr.y]="alto - 6" text-anchor="start">{{ primero.dia | date: 'd MMM' }}</text>
        }
        @if (g.puntos.length > 1) {
          @let ultimo = g.puntos[g.puntos.length - 1];
          <text class="grafica__eje" [attr.x]="ultimo?.x" [attr.y]="alto - 6" text-anchor="end">{{ ultimo?.dia | date: 'd MMM' }}</text>
        }
      </svg>
    }

    <table class="visually-hidden">
      <caption>{{ titulo() }}</caption>
      <thead>
        <tr><th scope="col">Día</th><th scope="col">Peso máximo (kg)</th><th scope="col">Volumen (kg)</th></tr>
      </thead>
      <tbody>
        @for (p of puntos(); track p.dia) {
          <tr><td>{{ p.dia | date: 'longDate' }}</td><td>{{ p.pesoMax }}</td><td>{{ p.volumen }}</td></tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: block;
    }

    .grafica {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }

    .grafica__guia {
      stroke: var(--color-border);
      stroke-dasharray: 4 6;
    }

    .grafica__eje {
      font-size: 12px;
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
  `,
})
export class GraficaProgreso {
  readonly puntos = input.required<readonly PuntoProgreso[]>();
  /** Descripción de la tabla accesible (p. ej. "Progreso de Press de banca"). */
  readonly titulo = input.required<string>();

  protected readonly ancho = ANCHO;
  protected readonly alto = ALTO;
  protected readonly margen = MARGEN;

  protected readonly geometria = computed(() => {
    const puntos = this.puntos();
    const pesos = puntos.map((p) => p.pesoMax);
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
      y: redondear(y(p.pesoMax)),
      record: p.pesoMax === maximo,
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
