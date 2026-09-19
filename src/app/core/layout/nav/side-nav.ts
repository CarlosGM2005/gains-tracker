import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NAV_ITEMS } from './nav-items';

/**
 * Barra lateral de escritorio: marca arriba, entradas grandes en mayúsculas y una barra naranja
 * que se estira en la entrada activa. Hover con desplazamiento corto (solo con puntero).
 */
@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="side" aria-label="Navegación principal">
      <a class="side__brand" routerLink="/inicio">
        <img class="side__logo" src="logo.svg" alt="" width="44" height="44" />
        <span class="side__name">Gains<span class="text-accent">Tracker</span></span>
      </a>

      <ul class="side__list">
        @for (item of items; track item.etiqueta) {
          <li>
            <a
              class="side__link"
              [routerLink]="item.ruta"
              routerLinkActive="side__link--activo"
              ariaCurrentWhenActive="page"
            >
              <img class="side__icon" [src]="item.icono" alt="" width="22" height="22" />
              <span>{{ item.etiqueta }}</span>
            </a>
          </li>
        }
      </ul>

      <p class="side__claim text-label">Mide · Mejora · Supera</p>
    </nav>
  `,
  styles: `
    .side {
      display: flex;
      flex-direction: column;
      gap: var(--space-10);
      height: 100%;
      padding: var(--space-8) var(--space-5);
      border-right: 1px solid var(--color-border);
    }

    .side__brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      text-decoration: none;
    }

    /* La insignia ya trae su fondo naranja: solo un halo suave del acento. */
    .side__logo {
      border-radius: 11px;
      box-shadow: 0 6px 24px var(--color-accent-soft);
      transition: transform var(--duration-base) var(--easing-spring);
    }

    @media (hover: hover) {
      .side__brand:hover .side__logo {
        transform: rotate(-6deg) scale(1.05);
      }
    }

    .side__name {
      font-family: var(--font-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
    }

    .side__list {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .side__link {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: 48px;
      padding: 0 var(--space-4);
      border-radius: var(--radius-sm);
      font-family: var(--font-display);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--letter-spacing-label);
      text-decoration: none;
      text-transform: uppercase;
      color: var(--color-text-muted);
      transition:
        color var(--duration-base) var(--easing-standard),
        background-color var(--duration-base) var(--easing-standard);
    }

    .side__link::before {
      position: absolute;
      inset-block: 10px;
      left: 0;
      width: 3px;
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      content: '';
      transform: scaleY(0);
      transition: transform var(--duration-base) var(--easing-out);
    }

    .side__icon {
      opacity: 0.7;
      transition: transform var(--duration-base) var(--easing-out);
    }

    .side__link--activo {
      background: var(--color-accent-soft);
      color: var(--color-text);
    }

    .side__link--activo::before {
      transform: none;
    }

    .side__link--activo .side__icon {
      opacity: 1;
    }

    @media (hover: hover) {
      .side__link:hover {
        color: var(--color-text);
      }

      .side__link:hover .side__icon {
        transform: translateX(3px);
      }
    }

    .side__claim {
      margin-top: auto;
    }
  `,
})
export class SideNav {
  protected readonly items = NAV_ITEMS.filter((i) => i.enEscritorio);
}
