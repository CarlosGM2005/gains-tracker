import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensajeDeErrorAuth } from '@core/auth/auth-errors';
import { MENSAJES_PERFIL, VALIDADORES_EMAIL } from '@features/perfil/public-api';
import { FieldError } from '@shared/forms/field-error';
import { refrescarConFormulario } from '@shared/forms/refrescar-con-formulario';
import { BackButton } from '@shared/ui/back-button/back-button';

import { SesionService } from '../state/sesion.service';
import { GoogleButton } from '../ui/google-button';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, BackButton, FieldError, GoogleButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './auth-page.scss',
})
export class LoginPage {
  private readonly sesion = inject(SesionService);

  /** Query param `?returnUrl=` que añade `authGuard`. */
  readonly returnUrl = input<string>();

  protected readonly mensajes = MENSAJES_PERFIL;
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', VALIDADORES_EMAIL],
    password: ['', Validators.required],
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    refrescarConFormulario(this.form);
  }

  protected async entrar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    await this.ejecutar(() => this.sesion.loginConEmail(email, password, this.returnUrl()));
  }

  protected entrarConGoogle(): Promise<void> {
    return this.ejecutar(() => this.sesion.loginConGoogle(this.returnUrl()));
  }

  private async ejecutar(accion: () => Promise<void>): Promise<void> {
    this.enviando.set(true);
    this.error.set(null);
    try {
      await accion();
    } catch (e) {
      this.error.set(mensajeDeErrorAuth(e));
    } finally {
      this.enviando.set(false);
    }
  }
}
