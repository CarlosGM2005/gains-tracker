import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '@core/auth/auth-store';
import { ToastService } from '@core/notifications/toast.service';

import { FavoritosStore } from '../state/favoritos-store';

/** Estrella para marcar un ejercicio como favorito. Sin sesión lleva al login y vuelve aquí. */
@Component({
  selector: 'app-favorito-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="btn btn--ghost btn--icon estrella"
      [class.estrella--activa]="activo()"
      [attr.aria-pressed]="activo()"
      [attr.aria-label]="activo() ? 'Quitar ' + nombre() + ' de favoritos' : 'Añadir ' + nombre() + ' a favoritos'"
      [disabled]="guardando()"
      (click)="alternar()"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
      </svg>
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

  protected async alternar(): Promise<void> {
    if (!this.auth.autenticado()) {
      this.toasts.mostrar('Inicia sesión para guardar tus favoritos.');
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.guardando.set(true);
    try {
      const favorito = await this.store.alternar(this.ejercicioId());
      this.toasts.exito(favorito ? 'Añadido a favoritos.' : 'Quitado de favoritos.', 2500);
    } catch {
      this.toasts.error('No se pudo actualizar tus favoritos. Inténtalo de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}
