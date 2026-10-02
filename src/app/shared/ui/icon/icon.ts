import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Iconos del set. Un nombre por concepto de la app, no por figura. */
export type IconName =
  | 'home'
  | 'ejercicios'
  | 'buscar'
  | 'recomendados'
  | 'registros'
  | 'estadisticas'
  | 'favoritos'
  | 'perfil'
  | 'privacidad'
  | 'logout'
  | 'instalar'
  | 'flecha-derecha'
  | 'flecha-izquierda'
  | 'check';

/**
 * Set de iconos de la app, dibujados a un solo trazo de 1.8 sobre una rejilla de 24.
 *
 * Son SVG en línea y pintan con `currentColor`, así que heredan el color del texto: el icono
 * activo de la barra puede ponerse naranja sin duplicar el archivo. Sustituyen a los PNG blancos
 * de `public/icons/`, que no admitían color, se veían blandos en pantallas de 3x y costaban una
 * petición cada uno.
 *
 * Son decorativos: van con `aria-hidden`, y el texto que los acompaña es el que se lee.
 * El tamaño sale de `size`, o de `--icon-size` si quien lo usa prefiere fijarlo desde el CSS.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      @switch (name()) {
        @case ('home') {
          <path d="M3.8 10.4 12 4.1l8.2 6.3" />
          <path d="M6.1 9.3v9.9a1 1 0 0 0 1 1h9.8a1 1 0 0 0 1-1V9.3" />
          <path d="M10 20.2v-4.8h4v4.8" />
        }
        @case ('ejercicios') {
          <path d="M4 9.8v4.4M7.2 7.4v9.2M16.8 7.4v9.2M20 9.8v4.4" />
          <path d="M7.2 12h9.6" />
        }
        @case ('buscar') {
          <circle cx="11" cy="11" r="6.4" />
          <path d="m15.8 15.8 4 4" />
        }
        @case ('recomendados') {
          <path
            d="M12 20.6a5.1 5.1 0 0 0 5.1-5.1c0-4.1-5.1-11.1-5.1-11.1s-5.1 7-5.1 11.1A5.1 5.1 0 0 0 12 20.6Z"
          />
          <path
            d="M12 20.6a2.2 2.2 0 0 0 2.2-2.2c0-1.8-2.2-4.7-2.2-4.7s-2.2 2.9-2.2 4.7A2.2 2.2 0 0 0 12 20.6Z"
          />
        }
        @case ('registros') {
          <path d="M9.4 3.9h5.2a1 1 0 0 1 1 1v1.7H8.4V4.9a1 1 0 0 1 1-1Z" />
          <path d="M15.6 5.8h2a1 1 0 0 1 1 1v12.3a1 1 0 0 1-1 1H6.4a1 1 0 0 1-1-1V6.8a1 1 0 0 1 1-1h2" />
          <path d="M9 10.8h6M9 14h6M9 17.2h3.4" />
        }
        @case ('estadisticas') {
          <path d="M4.6 19.6h14.8" />
          <path d="M8 19.6v-4.8M12 19.6v-9.2M16 19.6v-3" />
        }
        @case ('favoritos') {
          <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.6Z" />
        }
        @case ('perfil') {
          <circle cx="12" cy="8.4" r="3.8" />
          <path d="M5.2 20c0-3.6 3-5.6 6.8-5.6s6.8 2 6.8 5.6" />
        }
        @case ('privacidad') {
          <path d="M12 3.7 5.7 6.2v5.3c0 3.9 2.6 7.4 6.3 8.7 3.7-1.3 6.3-4.8 6.3-8.7V6.2L12 3.7Z" />
          <path d="m9.4 12 1.9 1.9 3.6-3.8" />
        }
        @case ('logout') {
          <path d="M14.4 8.2V6a1 1 0 0 0-1-1H6.6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6.8a1 1 0 0 0 1-1v-2.2" />
          <path d="M11 12h8.4" />
          <path d="m16.6 9.2 2.8 2.8-2.8 2.8" />
        }
        @case ('instalar') {
          <path d="M12 4v9.6" />
          <path d="m8.4 10.2 3.6 3.6 3.6-3.6" />
          <path d="M5.2 16.4v2.6a1 1 0 0 0 1 1h11.6a1 1 0 0 0 1-1v-2.6" />
        }
        @case ('flecha-derecha') {
          <path d="m9.8 5.6 6.6 6.4-6.6 6.4" />
        }
        @case ('flecha-izquierda') {
          <path d="M14.2 5.6 7.6 12l6.6 6.4" />
        }
        @case ('check') {
          <path d="m5.6 12.4 4.3 4.3 8.5-9.4" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex: none;
    }

    svg {
      width: var(--icon-size);
      height: var(--icon-size);
      /* Mismo trazo que la estrella de favoritos, para que todo el set pese igual. */
      fill: none;
      stroke: currentcolor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  host: {
    '[style.--icon-size]': "size() + 'px'",
  },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
}
