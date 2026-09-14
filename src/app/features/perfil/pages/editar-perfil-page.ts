import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthStore } from '@core/auth/auth-store';
import { esErrorAuth, mensajeDeErrorAuth } from '@core/auth/auth-errors';
import { ToastService } from '@core/notifications/toast.service';
import { FieldError } from '@shared/forms/field-error';
import { refrescarConFormulario } from '@shared/forms/refrescar-con-formulario';
import { BackButton } from '@shared/ui/back-button/back-button';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { Spinner } from '@shared/ui/spinner/spinner';

import { type CambiosPerfil, type Perfil } from '../domain/perfil.model';
import { MENSAJES_PERFIL, VALIDADORES_EMAIL, validadoresPerfil } from '../domain/perfil.rules';
import { PerfilStore } from '../state/perfil-store';
import { PerfilResumen } from '../ui/perfil-resumen';

type CampoEditable = keyof CambiosPerfil;

@Component({
  selector: 'app-editar-perfil-page',
  imports: [ReactiveFormsModule, BackButton, EmptyState, Spinner, FieldError, PerfilResumen],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editar-perfil-page.html',
  styleUrl: './editar-perfil-page.scss',
})
export class EditarPerfilPage {
  private readonly auth = inject(AuthStore);
  private readonly toasts = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly store = inject(PerfilStore);
  protected readonly mensajes = MENSAJES_PERFIL;

  private readonly validadores = validadoresPerfil(false);
  protected readonly datos = this.fb.group({
    nombre: ['', this.validadores.nombre],
    telefono: ['', this.validadores.telefono],
    edad: [null as number | null, this.validadores.edad],
    peso: [null as number | null, this.validadores.peso],
    altura: [null as number | null, this.validadores.altura],
  });
  protected readonly guardando = signal(false);

  protected readonly email = this.fb.group({
    nuevo: ['', VALIDADORES_EMAIL],
    password: [''],
  });
  protected readonly pideReautenticar = signal(false);
  protected readonly enviandoEmail = signal(false);
  protected readonly errorEmail = signal<string | null>(null);

  constructor() {
    refrescarConFormulario(this.datos);
    refrescarConFormulario(this.email);

    // Precarga el formulario con el perfil. No pisa lo que el usuario esté escribiendo.
    effect(() => {
      const perfil = this.store.perfil();
      if (perfil) {
        untracked(() => this.precargar(perfil));
      }
    });
  }

  /** Guarda solo los campos modificados (RF-13). Un campo vaciado se guarda como `null`. */
  protected async guardar(): Promise<void> {
    if (this.datos.invalid) {
      this.datos.markAllAsTouched();
      return;
    }
    const cambios = this.cambiosPendientes();
    if (Object.keys(cambios).length === 0) {
      this.toasts.mostrar('No hay cambios que guardar.');
      return;
    }
    this.guardando.set(true);
    try {
      await this.store.actualizar(cambios);
      this.datos.markAsPristine();
      this.toasts.exito('Cambios guardados con éxito');
    } catch {
      this.toasts.error('Hubo un problema al guardar los cambios');
    } finally {
      this.guardando.set(false);
    }
  }

  protected async cambiarEmail(): Promise<void> {
    if (this.email.invalid) {
      this.email.markAllAsTouched();
      return;
    }
    const { nuevo, password } = this.email.getRawValue();
    this.enviandoEmail.set(true);
    this.errorEmail.set(null);
    try {
      if (this.pideReautenticar()) {
        await this.auth.reautenticar(password);
      }
      await this.auth.solicitarCambioEmail(nuevo);
      this.email.controls.password.clearValidators();
      this.email.reset();
      this.pideReautenticar.set(false);
      this.toasts.exito(`Te hemos enviado un enlace a ${nuevo} para confirmar el cambio.`, 8000);
    } catch (e) {
      if (esErrorAuth(e, 'requiere-login-reciente')) {
        this.pideReautenticar.set(true);
        this.email.controls.password.setValidators(Validators.required);
        this.email.controls.password.updateValueAndValidity();
      }
      this.errorEmail.set(mensajeDeErrorAuth(e));
    } finally {
      this.enviandoEmail.set(false);
    }
  }

  private precargar(perfil: Perfil): void {
    const valores: Record<CampoEditable, string | number | null> = {
      nombre: perfil.nombre,
      telefono: perfil.telefono ?? '',
      edad: perfil.edad,
      peso: perfil.peso,
      altura: perfil.altura,
    };
    for (const [campo, valor] of Object.entries(valores)) {
      const control = this.datos.get(campo);
      if (control && !control.dirty) {
        control.setValue(valor);
      }
    }
  }

  private cambiosPendientes(): CambiosPerfil {
    const cambios: Record<string, unknown> = {};
    for (const [campo, control] of Object.entries(this.datos.controls)) {
      if (control.dirty) {
        // Un teléfono vaciado se guarda como null (dato no informado).
        cambios[campo] = control.value === '' ? null : control.value;
      }
    }
    return cambios as CambiosPerfil;
  }
}
