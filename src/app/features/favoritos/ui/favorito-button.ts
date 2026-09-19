import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '@core/auth/auth-store';
import { ToastService } from '@core/notifications/toast.service';

import { FavoritosStore } from '../state/favoritos-store';

/** Ángulos de las chispas que salen al marcar favorito (una cada 60°). */
const CHISPAS = [0, 60, 120, 180, 240, 300];

/**
 * Estrella para marcar un ejercicio como favorito. Sin sesión lleva al login y vuelve aquí.
 * Al marcarla (no al cargar una ya marcada) late y suelta seis chispas del acento.
 */
@Component({
  selector: 'app-favorito-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="btn btn--ghost btn--icon estrella"
      [class.estrella--activa]="activo()"
      [class.estrella--estalla]="estalla() && activo()"
      [attr.aria-pressed]="activo()"
      [attr.aria-label]="activo() ? 'Quitar ' + nombre() + ' de favoritos' : 'Añadir ' + nombre() + ' a favoritos'"
      [disabled]="guardando()"
      (click)="alternar()"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
      </svg>
      @for (angulo of chispas; track angulo) {
        <span class="chispa" aria-hidden="true" [style.--angulo]="angulo + 'deg'"></span>
      }
    </button>
  `,
  styles: `
    .estrella svg {
      fill: none;
      stroke: currentcolor;
      stroke-linejoin: round;
      stroke-width: 1.8;
      transition:
        fill var(--duration-base) var(--easing-standard),
        transform var(--duration-base) var(--easing-out);
    }

    .estrella--activa {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .estrella--activa svg {
      fill: currentcolor;
      animation: latido var(--duration-slow) var(--easing-out);
    }

    @keyframes latido {
      40% {
        transform: scale(1.3);
      }
    }

    /* Estrella que estalla: 6 puntos del acento salen en círculo 22 px y se apagan (600 ms). */
    .chispa {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      margin: -2.5px 0 0 -2.5px;
      border-radius: 50%;
      background: var(--color-accent);
      opacity: 0;
      pointer-events: none;
    }

    .estrella--estalla .chispa {
      animation: chispa 600ms var(--easing-out) both;
      animation-delay: 80ms;
    }

    @keyframes chispa {
      from {
        opacity: 1;
        transform: rotate(var(--angulo)) translateY(-8px) scale(1);
      }

      to {
        opacity: 0;
        transform: rotate(var(--angulo)) translateY(-26px) scale(0.2);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .chispa {
        display: none;
      }
    }
  `,
})
export class FavoritoButton {
  private readonly auth = inject(AuthStore);
  private readonly store = inject(FavoritosStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  readonly ejercicioId = input.required<string>();
  /** Nombre del ejercicio, para el texto accesible. */
  readonly nombre = input.required<string>();

  protected readonly activo = computed(() => this.store.ids().includes(this.ejercicioId()));
  protected readonly guardando = signal(false);
  protected readonly chispas = CHISPAS;
  /** Solo tras marcarla el usuario: una estrella que ya venía marcada no estalla al cargar. */
  protected readonly estalla = signal(false);

  protected async alternar(): Promise<void> {
    if (!this.auth.autenticado()) {
      this.toasts.mostrar('Inicia sesión para guardar tus favoritos.');
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.guardando.set(true);
    try {
      const favorito = await this.store.alternar(this.ejercicioId());
      this.estalla.set(favorito);
      this.toasts.exito(favorito ? 'Añadido a favoritos.' : 'Quitado de favoritos.', 2500);
    } catch (error) {
      // En consola queda el motivo real (p. ej. "permission-denied" si las reglas de Firestore
      // publicadas no permiten el campo `favoritos`).
      console.error('No se pudo guardar el favorito', error);
      this.toasts.error('No se pudo actualizar tus favoritos. Inténtalo de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}
