import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensajeDeErrorAuth } from '@core/auth/auth-errors';
import { ToastService } from '@core/notifications/toast.service';
import {
  MENSAJES_PERFIL,
  VALIDADORES_EMAIL,
  VALIDADORES_PASSWORD,
  validadoresPerfil,
} from '@features/perfil/public-api';
import { FieldError } from '@shared/forms/field-error';
import { refrescarConFormulario } from '@shared/forms/refrescar-con-formulario';
import { BackButton } from '@shared/ui/back-button/back-button';

import { SesionService } from '../state/sesion.service';

@Component({
  selector: 'app-registro-page',
  imports: [ReactiveFormsModule, RouterLink, BackButton, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registro-page.html',
  styleUrl: './auth-page.scss',
})
export class RegistroPage {
  private readonly sesion = inject(SesionService);
  private readonly toasts = inject(ToastService);

  protected readonly mensajes = MENSAJES_PERFIL;
  private readonly validadores = validadoresPerfil(true);
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', this.validadores.nombre],
    email: ['', VALIDADORES_EMAIL],
    password: ['', VALIDADORES_PASSWORD],
    telefono: ['', this.validadores.telefono],
    // `null` para que el campo numérico empiece vacío.
    edad: [null as number | null, this.validadores.edad],
    peso: [null as number | null, this.validadores.peso],
    altura: [null as number | null, this.validadores.altura],
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    refrescarConFormulario(this.form);
  }

  protected async crearCuenta(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { edad, peso, altura, ...resto } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);
    try {
      // Los validadores `required` garantizan que no son null.
      await this.sesion.registrar({ ...resto, edad: edad ?? 0, peso: peso ?? 0, altura: altura ?? 0 });
      this.toasts.exito('¡Registro exitoso!');
    } catch (e) {
      this.error.set(mensajeDeErrorAuth(e));
    } finally {
      this.enviando.set(false);
    }
  }
}
