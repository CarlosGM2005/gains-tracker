import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthStore } from '@core/auth/auth-store';
import { ToastService } from '@core/notifications/toast.service';
import { FieldError } from '@shared/forms/field-error';
import { refrescarConFormulario } from '@shared/forms/refrescar-con-formulario';

import { type EjercicioRegistrable, LIMITES_SERIE } from '../domain/registro.model';
import { RegistrosStore } from '../state/registros-store';

const OBLIGATORIO = 'Campo obligatorio.';

/** Ventana para registrar una serie de un ejercicio. Sin sesión invita a iniciar sesión. */
@Component({
  selector: 'app-registrar-serie-dialog',
  imports: [ReactiveFormsModule, FieldError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registrar-serie-dialog.html',
  styleUrl: './registrar-serie-dialog.scss',
})
export class RegistrarSerieDialog {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly registros = inject(RegistrosStore);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly ejercicio = inject<EjercicioRegistrable>(DIALOG_DATA);
  protected readonly autenticado = inject(AuthStore).autenticado;
  protected readonly enviando = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    dia: ['', Validators.required],
    series: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.series.min)]],
    repeticiones: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.repeticiones.min)]],
    peso: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.peso.min)]],
    descansoMin: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.descansoMin.min)]],
  });

  protected readonly mensajes = {
    dia: { required: OBLIGATORIO },
    series: { required: OBLIGATORIO, min: 'Mínimo 1 serie.' },
    repeticiones: { required: OBLIGATORIO, min: 'Mínimo 1 repetición.' },
    peso: { required: OBLIGATORIO, min: 'El peso no puede ser negativo.' },
    descansoMin: { required: OBLIGATORIO, min: 'El descanso no puede ser negativo.' },
  } as const;

  constructor() {
    refrescarConFormulario(this.form);
  }

  protected async registrar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { dia, series, repeticiones, peso, descansoMin } = this.form.getRawValue();
    this.enviando.set(true);
    try {
      await this.registros.agregarSerie(this.ejercicio, {
        dia,
        series: series ?? 0,
        repeticiones: repeticiones ?? 0,
        peso: peso ?? 0,
        descansoMin: descansoMin ?? 0,
      });
      this.dialogRef.close(true);
      this.toasts.exito('¡Serie registrada con éxito!', 5000);
    } catch {
      this.toasts.error('Hubo un error al registrar la serie, intenta de nuevo.');
    } finally {
      this.enviando.set(false);
    }
  }

  protected irALogin(): void {
    const returnUrl = this.router.url;
    this.dialogRef.close(false);
    void this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  protected cerrar(): void {
    this.dialogRef.close(false);
  }
}
