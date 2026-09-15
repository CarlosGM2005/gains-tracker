import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { esErrorAuth, mensajeDeErrorAuth } from '@core/auth/auth-errors';
import { AuthStore } from '@core/auth/auth-store';
import { AuthError } from '@core/auth/auth.model';
import { ToastService } from '@core/notifications/toast.service';
import { FieldError } from '@shared/forms/field-error';
import { refrescarConFormulario } from '@shared/forms/refrescar-con-formulario';
import { BackButton } from '@shared/ui/back-button/back-button';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog';

import { MENSAJES_PERFIL } from '../domain/perfil.rules';
import { EliminarCuentaService } from '../state/eliminar-cuenta.service';

/** Zona de peligro: explica qué se borra, pide la contraseña (o Google) y una última confirmación. */
@Component({
  selector: 'app-eliminar-cuenta-page',
  imports: [ReactiveFormsModule, BackButton, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page eliminar">
      <div class="eliminar__top">
        <app-back-button />
      </div>

      <section class="bloque stagger" aria-labelledby="eliminar-titulo">
        <p class="text-label eliminar__overline">Zona de peligro</p>
        <h1 id="eliminar-titulo" class="eliminar__titulo">Eliminar cuenta</h1>

        <div class="eliminar__texto">
          <p>Se borrarán para siempre:</p>
          <ul>
            <li>Tus datos de perfil y tu foto.</li>
            <li>Todos tus registros de series.</li>
            <li>Tus ejercicios favoritos.</li>
            <li>Tu cuenta de acceso ({{ email() }}).</li>
          </ul>
          <p><strong>No se puede deshacer.</strong></p>
        </div>

        <form class="form" [formGroup]="form" (ngSubmit)="eliminar()" novalidate>
          @if (error(); as mensaje) {
            <p class="form__alert" role="alert">{{ mensaje }}</p>
          }

          @if (esGoogle()) {
            <p class="eliminar__nota">Para confirmar que eres tú, se abrirá una ventana de Google.</p>
          } @else {
            <div class="field">
              <label class="field__label" for="el-password">Contraseña actual</label>
              <input id="el-password" class="input" type="password" formControlName="password"
                autocomplete="current-password" aria-describedby="el-password-error" />
              <app-field-error [control]="form.controls.password" [mensajes]="mensajes.password" idError="el-password-error" />
            </div>
          }

          <label class="check">
            <input type="checkbox" formControlName="entiendo" />
            <span>Entiendo que perderé todos mis datos.</span>
          </label>

          <button type="submit" class="btn btn--danger btn--lg eliminar__submit" [disabled]="eliminando() || form.invalid">
            {{ eliminando() ? 'Eliminando…' : 'Eliminar mi cuenta' }}
          </button>
        </form>
      </section>
    </div>
  `,
  styles: `
    .eliminar {
      max-width: 40rem;
    }

    .eliminar__top {
      margin-bottom: var(--space-4);
    }

    .bloque {
      display: grid;
      gap: var(--space-5);
      padding: var(--space-6) var(--space-5);
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .eliminar__overline {
      margin-bottom: calc(var(--space-4) * -1);
      color: var(--color-danger);
    }

    .eliminar__titulo {
      font-size: var(--font-size-2xl);
    }

    .eliminar__texto,
    .eliminar__nota {
      display: grid;
      gap: var(--space-2);
      color: var(--color-text-muted);
    }

    .eliminar__texto ul {
      margin: 0;
      padding-left: var(--space-5);
    }

    .eliminar__texto strong {
      color: var(--color-text);
    }

    .check {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: var(--tap-target);
      cursor: pointer;
    }

    .check input {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: var(--color-danger);
    }

    .eliminar__submit {
      width: 100%;
    }
  `,
})
export class EliminarCuentaPage {
  private readonly auth = inject(AuthStore);
  private readonly servicio = inject(EliminarCuentaService);
  private readonly confirmacion = inject(ConfirmService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly mensajes = MENSAJES_PERFIL;
  protected readonly email = computed(() => this.auth.sesion()?.email ?? '');
  protected readonly esGoogle = computed(() => this.auth.sesion()?.proveedor === 'google');
  protected readonly eliminando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    // Los usuarios de Google no escriben contraseña: el validador solo se aplica a cuentas de correo.
    password: ['', this.esGoogle() ? [] : [Validators.required]],
    entiendo: [false, Validators.requiredTrue],
  });

  constructor() {
    refrescarConFormulario(this.form);
  }

  protected async eliminar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const confirmado = await this.confirmacion.confirmar({
      titulo: '¿Eliminar tu cuenta?',
      mensaje: 'Última comprobación: se borrarán tu perfil, tus registros y tus favoritos, y no podrás recuperarlos.',
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!confirmado) {
      return;
    }

    this.eliminando.set(true);
    this.error.set(null);
    try {
      await this.servicio.eliminar(this.esGoogle() ? null : this.form.controls.password.value);
      this.toasts.exito('Tu cuenta y tus datos se han eliminado.', 8000);
      await this.router.navigateByUrl('/');
    } catch (e) {
      if (esErrorAuth(e, 'credenciales-invalidas')) {
        this.error.set('La contraseña no es correcta.');
      } else if (e instanceof AuthError) {
        this.error.set(mensajeDeErrorAuth(e));
      } else {
        this.error.set('No se pudo eliminar la cuenta. Comprueba tu conexión e inténtalo de nuevo.');
      }
    } finally {
      this.eliminando.set(false);
    }
  }
}
