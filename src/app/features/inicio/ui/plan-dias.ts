import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { type DiasPorSemana, OPCIONES_DIAS, RUTINAS } from '../domain/rutina';

const LETRAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/**
 * Desplegable "Entreno N días" de la cabecera de Rutinas (patrón listbox de ARIA).
 * - Botón: el número cambia subiendo desde una máscara y la flecha gira con rebote.
 * - Lista: se abre desde arriba con muelle; las opciones entran escalonadas; una pastilla se
 *   desliza hasta la opción resaltada (ratón o teclado); cada opción enseña en qué días de la
 *   semana se entrena con ese plan.
 * Teclado: flechas, Inicio/Fin, Enter/Espacio elige, Escape cierra y devuelve el foco. Con ratón o
 * dedo se elige al soltar (`pointerup`); el teclado lo gestiona la lista, que tiene el foco.
 */
@Component({
  selector: 'app-plan-dias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'plan',
    '[class.plan--abierto]': 'abierto()',
    '(document:pointerdown)': 'alPulsarFuera($event)',
  },
  template: `
    <button
      #boton
      type="button"
      class="plan__boton"
      aria-haspopup="listbox"
      [attr.aria-expanded]="abierto()"
      aria-controls="plan-dias-lista"
      (click)="alternar()"
      (keydown.arrowdown)="abrir($event)"
      (keydown.arrowup)="abrir($event)"
    >
      <span class="plan__etiqueta">Entreno</span>
      <span class="plan__valor">
        <span class="plan__mascara">
          @for (n of [valor()]; track n) {
            <span class="plan__numero">{{ n }}</span>
          }
        </span>
        días
      </span>
      <span class="plan__flecha" aria-hidden="true">
        <svg viewBox="0 0 12 12" width="12" height="12"><path d="M2 4.5 6 8.5 10 4.5" /></svg>
      </span>
    </button>

    <ul
      #lista
      id="plan-dias-lista"
      class="plan__lista"
      role="listbox"
      tabindex="-1"
      aria-label="Días de entrenamiento por semana"
      [attr.aria-activedescendant]="abierto() ? idResaltado() : null"
      [style.--resaltado]="resaltado()"
      (keydown)="alTeclear($event)"
      (focusout)="alSalirFoco($event)"
    >
      @for (opcion of opciones; track opcion.dias; let i = $index) {
        <li
          class="opcion"
          role="option"
          [id]="'plan-dias-' + opcion.dias"
          [attr.aria-selected]="opcion.dias === valor()"
          [class.opcion--elegida]="opcion.dias === valor()"
          [style.--i]="i"
          (pointerenter)="resaltado.set(i)"
          (pointerup)="elegir(opcion.dias)"
        >
          <span class="opcion__texto">
            <span class="opcion__dias">{{ opcion.dias }} días</span>
            <span class="opcion__semana" aria-hidden="true">
              @for (letra of letras; track $index; let d = $index) {
                <span class="punto" [class.punto--activo]="opcion.entrena[d]" [style.--d]="d">{{ letra }}</span>
              }
            </span>
          </span>
          <span class="opcion__check" aria-hidden="true">✓</span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
    }

    /* Botón */
    .plan__boton {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      min-height: 40px;
      padding: 0 var(--space-3) 0 var(--space-4);
      border: 1px solid var(--color-accent);
      border-radius: var(--radius-pill);
      background: var(--color-accent-soft);
      font-family: var(--font-display);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--letter-spacing-label);
      text-transform: uppercase;
      color: var(--color-text);
      transition:
        background-color var(--duration-base) var(--easing-standard),
        box-shadow var(--duration-base) var(--easing-standard),
        transform var(--duration-fast) var(--easing-standard);
    }

    .plan__boton:active {
      transform: scale(0.96);
    }

    :host(.plan--abierto) .plan__boton {
      background: rgb(from var(--color-accent) r g b / 24%);
      box-shadow: 0 0 0 4px var(--color-accent-soft);
    }

    .plan__etiqueta {
      color: var(--color-text-muted);
    }

    .plan__valor {
      display: inline-flex;
      align-items: baseline;
      gap: 0.3em;
    }

    /* El número nuevo sube desde detrás de una máscara al cambiar de plan. */
    .plan__mascara {
      display: inline-block;
      overflow: hidden;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      line-height: 1.1;
      color: var(--color-accent);
    }

    .plan__numero {
      display: block;
      animation: line-up 420ms var(--easing-spring) both;
    }

    .plan__flecha {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-accent);
      transition: transform 420ms var(--easing-spring);
    }

    .plan__flecha svg {
      fill: none;
      stroke: var(--color-on-accent);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
    }

    :host(.plan--abierto) .plan__flecha {
      transform: rotate(180deg);
    }

    @media (hover: hover) {
      .plan__boton:hover {
        background: rgb(from var(--color-accent) r g b / 24%);
      }

      :host(:not(.plan--abierto)) .plan__boton:hover .plan__flecha {
        transform: translateY(2px);
      }
    }

    /* Lista: cerrada sigue en el DOM para poder animar la salida; visibility la saca del foco. */
    .plan__lista {
      --alto-opcion: 60px;

      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      z-index: 20;
      width: 15.5rem;
      max-width: calc(100vw - 2 * var(--page-gutter));
      margin: 0;
      padding: var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: var(--shadow-card);
      list-style: none;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px) scale(0.94);
      transform-origin: top right;
      transition:
        opacity 160ms var(--easing-standard),
        transform 200ms var(--easing-standard),
        visibility 0s linear 200ms;
    }

    .plan__lista:focus {
      outline: none;
    }

    :host(.plan--abierto) .plan__lista {
      opacity: 1;
      visibility: visible;
      transform: none;
      transition:
        opacity 180ms var(--easing-standard),
        transform 380ms var(--easing-spring),
        visibility 0s;
    }

    /* Pastilla que se desliza hasta la opción resaltada (ratón o teclado). */
    .plan__lista::before {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      left: var(--space-2);
      height: var(--alto-opcion);
      border-radius: var(--radius-md);
      background: var(--color-accent-soft);
      box-shadow: inset 0 0 0 1px rgb(from var(--color-accent) r g b / 40%);
      transform: translateY(calc(var(--resaltado, 0) * var(--alto-opcion)));
      content: '';
      transition: transform 360ms var(--easing-spring);
      pointer-events: none;
    }

    .opcion {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--alto-opcion);
      padding: 0 var(--space-3);
      cursor: pointer;
    }

    :host(.plan--abierto) .opcion {
      animation: rise-in 320ms var(--easing-out) backwards;
      animation-delay: calc(60ms + var(--i, 0) * 45ms);
    }

    .opcion__texto {
      display: grid;
      gap: var(--space-1);
    }

    .opcion__dias {
      font-family: var(--font-display);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
    }

    .opcion--elegida .opcion__dias {
      color: var(--color-accent);
    }

    /* Semana en miniatura: los días que se entrena, en naranja. */
    .opcion__semana {
      display: flex;
      gap: 3px;
    }

    .punto {
      display: grid;
      place-items: center;
      width: 18px;
      height: 18px;
      border-radius: 5px;
      background: var(--color-surface-2);
      font-size: 10px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-muted);
    }

    .punto--activo {
      background: var(--color-accent);
      color: var(--color-on-accent);
    }

    :host(.plan--abierto) .punto--activo {
      animation: saltar 300ms var(--easing-spring) backwards;
      animation-delay: calc(140ms + var(--i, 0) * 45ms + var(--d, 0) * 25ms);
    }

    @keyframes saltar {
      from {
        transform: scale(0.4);
      }
    }

    .opcion__check {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-accent);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-on-accent);
      opacity: 0;
      transform: scale(0.4);
      transition:
        opacity var(--duration-base) var(--easing-standard),
        transform 360ms var(--easing-spring);
    }

    .opcion--elegida .opcion__check {
      opacity: 1;
      transform: none;
    }
  `,
})
export class PlanDias {
  private readonly injector = inject(Injector);
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly lista = viewChild.required<ElementRef<HTMLElement>>('lista');

  readonly valor = input.required<DiasPorSemana>();
  readonly valorChange = output<DiasPorSemana>();

  protected readonly letras = LETRAS_SEMANA;
  /** Cada plan con los 7 días de la semana marcados si se entrena (lunes primero). */
  protected readonly opciones = OPCIONES_DIAS.map((dias) => {
    const semana = new Set(RUTINAS[dias].map((d) => d.diaSemana));
    return { dias, entrena: LETRAS_SEMANA.map((_, i) => semana.has(i + 1)) };
  });

  protected readonly abierto = signal(false);
  protected readonly resaltado = signal(0);
  private readonly indiceElegido = computed(() => this.opciones.findIndex((o) => o.dias === this.valor()));
  private readonly opcionResaltada = computed(() => this.opciones[this.resaltado()]);
  protected readonly idResaltado = computed(() => {
    const opcion = this.opcionResaltada();
    return opcion ? `plan-dias-${opcion.dias}` : null;
  });

  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar(false);
    } else {
      this.abrir();
    }
  }

  protected abrir(evento?: Event): void {
    evento?.preventDefault();
    this.resaltado.set(Math.max(0, this.indiceElegido()));
    this.abierto.set(true);
    // La lista se enfoca cuando ya es visible (tras pintar el cambio de clase).
    afterNextRender(() => this.lista().nativeElement.focus(), { injector: this.injector });
  }

  protected elegir(dias: DiasPorSemana): void {
    if (dias !== this.valor()) {
      this.valorChange.emit(dias);
    }
    this.cerrar(true);
  }

  protected alTeclear(evento: KeyboardEvent): void {
    const ultimo = this.opciones.length - 1;
    switch (evento.key) {
      case 'ArrowDown':
        this.resaltado.update((i) => (i >= ultimo ? 0 : i + 1));
        break;
      case 'ArrowUp':
        this.resaltado.update((i) => (i <= 0 ? ultimo : i - 1));
        break;
      case 'Home':
        this.resaltado.set(0);
        break;
      case 'End':
        this.resaltado.set(ultimo);
        break;
      case 'Enter':
      case ' ': {
        const opcion = this.opcionResaltada();
        if (opcion) {
          this.elegir(opcion.dias);
        }
        break;
      }
      case 'Escape':
        this.cerrar(true);
        break;
      case 'Tab':
        this.cerrar(false);
        return;
      default:
        return;
    }
    evento.preventDefault();
  }

  protected alSalirFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (this.abierto() && destino !== this.boton().nativeElement && !this.lista().nativeElement.contains(destino)) {
      this.cerrar(false);
    }
  }

  protected alPulsarFuera(evento: PointerEvent): void {
    const host = this.boton().nativeElement.parentElement;
    if (this.abierto() && host && !host.contains(evento.target as Node)) {
      this.cerrar(false);
    }
  }

  private cerrar(devolverFoco: boolean): void {
    this.abierto.set(false);
    if (devolverFoco) {
      this.boton().nativeElement.focus();
    }
  }
}
