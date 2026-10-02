import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Icon } from '@shared/ui/icon/icon';

import { NAV_ITEMS } from './nav-items';

/**
 * Barra inferior de móvil: icono con etiqueta corta y una píldora naranja detrás de la entrada
 * activa. Respeta la zona segura inferior del iPhone.
 */
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bottom" aria-label="Navegación principal">
      @for (item of items; track item.etiqueta) {
        <a
          class="bottom__link"
          [routerLink]="item.ruta"
          routerLinkActive="bottom__link--activo"
          ariaCurrentWhenActive="page"
        >
          <span class="bottom__pill">
            <app-icon [name]="item.icono" [size]="24" />
          </span>
          <span class="bottom__label">{{ item.etiqueta }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    .bottom {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      min-height: var(--bottom-nav-height);
      padding-bottom: env(safe-area-inset-bottom);
      border-top: 1px solid var(--color-border);
      /* Opaca a propósito: al ir fija sobre el contenido, un backdrop-filter se recalcula en cada
         fotograma del scroll, y a 88 % de opacidad el desenfoque no se apreciaba. */
      background: var(--color-bg);
    }

    .bottom__link {
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 2px;
      min-height: var(--tap-target);
      text-decoration: none;
      color: var(--color-text-muted);
      transition: color var(--duration-base) var(--easing-standard);
    }

    .bottom__link:active .bottom__pill {
      transform: scale(0.9);
    }

    .bottom__pill {
      display: grid;
      place-items: center;
      width: 56px;
      height: 30px;
      border-radius: var(--radius-pill);
      transition:
        background-color var(--duration-base) var(--easing-standard),
        transform var(--duration-fast) var(--easing-standard);
    }

    .bottom__pill app-icon {
      color: var(--color-text-muted);
      transition: color var(--duration-base) var(--easing-standard);
    }

    .bottom__label {
      font-size: 0.6875rem;
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .bottom__link--activo {
      color: var(--color-text);
    }

    .bottom__link--activo .bottom__pill {
      background: var(--color-accent-soft);
      box-shadow: inset 0 0 0 1px var(--color-accent);
    }

    .bottom__link--activo .bottom__pill app-icon {
      color: var(--color-accent);
    }
  `,
})
export class BottomNav {
  protected readonly items = NAV_ITEMS.filter((i) => i.enMovil);
}
