import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-outlet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of servicio.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast--exito]="toast.tipo === 'exito'"
          [class.toast--error]="toast.tipo === 'error'"
          [attr.role]="toast.tipo === 'error' ? 'alert' : 'status'"
        >
          <span class="toast__bar" aria-hidden="true"></span>
          <p class="toast__msg">{{ toast.mensaje }}</p>
          <button type="button" class="toast__close" aria-label="Cerrar aviso" (click)="servicio.cerrar(toast.id)">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      inset-inline: var(--page-gutter);
      bottom: calc(var(--bottom-nav-height) + var(--space-4) + env(safe-area-inset-bottom));
      z-index: 50;
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: min(100%, 28rem);
      padding: var(--space-3) var(--space-3) var(--space-3) 0;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      box-shadow: var(--shadow-card);
      pointer-events: auto;
      animation: toast-in 420ms var(--easing-spring) both;
    }

    /* Entrada con muelle: sube, crece y se pasa un poco antes de asentarse. */
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }

      to {
        opacity: 1;
        transform: none;
      }
    }

    .toast__bar {
      align-self: stretch;
      width: 4px;
      background: var(--color-text-muted);
    }

    .toast--exito .toast__bar {
      background: var(--color-success);
    }

    .toast--error .toast__bar {
      background: var(--color-danger);
    }

    .toast__msg {
      flex: 1;
      font-weight: var(--font-weight-semibold);
    }

    .toast__close {
      min-width: var(--tap-target);
      min-height: var(--tap-target);
      border: 0;
      background: none;
      font-size: var(--font-size-lg);
      color: var(--color-text-muted);
    }

    @media (width >= 992px) {
      .toasts {
        bottom: var(--space-6);
      }
    }
  `,
})
export class ToastOutlet {
  protected readonly servicio = inject(ToastService);
}
