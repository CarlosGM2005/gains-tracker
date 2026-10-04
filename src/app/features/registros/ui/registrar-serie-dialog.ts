import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthStore } from '@core/auth/auth-store';
import { ToastService } from '@core/notifications/toast.service';
import { FieldError } from '@shared/forms/field-error';
import { refrescarConFormulario } from '@shared/forms/refrescar-con-formulario';
import { diaLocal } from '@shared/utils/fechas';

import { esNuevoRecord } from '../domain/estadisticas';
import {
  type EjercicioRegistrable,
  LIMITES_SERIE,
  notaONull,
  type NuevaSerie,
  rpeONull,
  type Serie,
  ultimaSerie,
} from '../domain/registro.model';
import { RegistrosStore } from '../state/registros-store';

const OBLIGATORIO = 'Campo obligatorio.';

/** Campos numéricos con botones de restar y sumar, y cuánto mueve cada pulsación. */
const PASOS = { series: 1, repeticiones: 1, peso: 2.5, descansoMin: 1 } as const;
type CampoNumerico = keyof typeof PASOS;

/** Escala RPE de 1 a 10 en botones (dos filas de cinco). */
const VALORES_RPE = Array.from({ length: LIMITES_SERIE.rpe.max }, (_, i) => i + 1);

/** Qué significa cada RPE, contado en repeticiones que quedaban en reserva. */
function ayudaRpe(rpe: number | null): string {
  if (rpe === null) {
    return 'Cuánto te costó, del 1 al 10. Toca otra vez el número para quitarlo.';
  }
  if (rpe >= 10) {
    return 'Al límite: no salía ni una repetición más.';
  }
  if (rpe === 9) {
    return 'Muy duro: quedaba 1 repetición.';
  }
  if (rpe >= 7) {
    return `Duro: quedaban ${10 - rpe} repeticiones.`;
  }
  return rpe >= 5 ? 'Moderado: quedaban 4 o más repeticiones.' : 'Suave: calentamiento o técnica.';
}

export interface DatosSerieDialog {
  ejercicio: EjercicioRegistrable;
  /** Si llega, la ventana edita esta serie en lugar de registrar una nueva. */
  serie?: Serie;
}

/**
 * Ventana para registrar o editar una serie de un ejercicio. Sin sesión invita a iniciar sesión.
 *
 * Para registrar rápido en el gimnasio: el día viene puesto en hoy, el formulario se rellena con la
 * última serie del ejercicio y "Repetir hoy" la guarda de un toque. Los botones − y + ajustan cada
 * número sin abrir el teclado.
 *
 * El esfuerzo percibido (RPE) y la nota son opcionales y van plegados en "Esfuerzo y nota". Son
 * propios de cada serie: no se copian de la última al rellenar ni al repetir.
 */
@Component({
  selector: 'app-registrar-serie-dialog',
  imports: [ReactiveFormsModule, FieldError, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registrar-serie-dialog.html',
  styleUrl: './registrar-serie-dialog.scss',
})
export class RegistrarSerieDialog {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly registros = inject(RegistrosStore);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  private readonly datos = inject<DatosSerieDialog>(DIALOG_DATA);
  protected readonly ejercicio = this.datos.ejercicio;
  protected readonly editando = this.datos.serie ?? null;
  protected readonly autenticado = inject(AuthStore).autenticado;
  protected readonly enviando = signal(false);
  protected readonly valoresRpe = VALORES_RPE;
  protected readonly maxNota = LIMITES_SERIE.nota.maxLength;
  protected readonly ayudaRpe = ayudaRpe;
  /** Al editar una serie con RPE o nota, el bloque opcional empieza abierto. */
  protected readonly notasAbiertas = !!this.editando && (this.editando.rpe !== null || !!this.editando.nota);

  /** Series ya guardadas de este ejercicio. */
  private readonly anteriores = computed<readonly Serie[]>(
    () => this.registros.registros().find((r) => r.ejercicioId === this.ejercicio.id)?.series ?? [],
  );
  /** Última serie del ejercicio, para rellenar el formulario y para "Repetir hoy". */
  protected readonly ultima = computed(() => (this.editando ? null : ultimaSerie(this.anteriores())));

  protected readonly form = inject(NonNullableFormBuilder).group({
    dia: [diaLocal(new Date()), Validators.required],
    series: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.series.min)]],
    repeticiones: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.repeticiones.min)]],
    peso: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.peso.min)]],
    descansoMin: [null as number | null, [Validators.required, Validators.min(LIMITES_SERIE.descansoMin.min)]],
    rpe: [null as number | null, [Validators.min(LIMITES_SERIE.rpe.min), Validators.max(LIMITES_SERIE.rpe.max)]],
    nota: ['', Validators.maxLength(LIMITES_SERIE.nota.maxLength)],
  });

  protected readonly mensajes = {
    dia: { required: OBLIGATORIO },
    series: { required: OBLIGATORIO, min: 'Mínimo 1 serie.' },
    repeticiones: { required: OBLIGATORIO, min: 'Mínimo 1 repetición.' },
    peso: { required: OBLIGATORIO, min: 'El peso no puede ser negativo.' },
    descansoMin: { required: OBLIGATORIO, min: 'El descanso no puede ser negativo.' },
    nota: { maxlength: `La nota admite como máximo ${LIMITES_SERIE.nota.maxLength} caracteres.` },
  } as const;

  constructor() {
    refrescarConFormulario(this.form);
    if (this.editando) {
      const { dia, series, repeticiones, peso, descansoMin, rpe, nota } = this.editando;
      this.form.setValue({ dia, series, repeticiones, peso, descansoMin, rpe, nota: nota ?? '' });
    } else {
      // Los registros pueden llegar después de abrir la ventana: se rellena en cuanto están, una
      // sola vez y solo si el usuario no ha empezado a escribir.
      let relleno = false;
      effect(() => {
        const ultima = this.ultima();
        if (ultima && !relleno && this.form.pristine) {
          relleno = true;
          const { series, repeticiones, peso, descansoMin } = ultima;
          untracked(() => this.form.patchValue({ series, repeticiones, peso, descansoMin }));
        }
      });
    }
  }

  /** Botones − y +: suman `PASOS[campo]` sin bajar del mínimo. Un campo vacío empieza en el mínimo. */
  protected ajustar(campo: CampoNumerico, sentido: 1 | -1): void {
    const control = this.form.controls[campo];
    const minimo = LIMITES_SERIE[campo].min;
    const actual = control.value ?? minimo;
    const siguiente = Math.max(minimo, Math.round((actual + sentido * PASOS[campo]) * 100) / 100);
    control.setValue(siguiente);
    control.markAsDirty();
    control.markAsTouched();
  }

  /** Elige un RPE; tocar el que ya está elegido lo quita. */
  protected elegirRpe(valor: number): void {
    const control = this.form.controls.rpe;
    control.setValue(control.value === valor ? null : valor);
    control.markAsDirty();
  }

  /** Lo que se ha rellenado del bloque opcional, para verlo con el bloque plegado. */
  protected resumenNotas(): string {
    const { rpe, nota } = this.form.getRawValue();
    const partes = [rpe === null ? '' : `RPE ${rpe}`, nota.trim() ? 'Con nota' : ''].filter(Boolean);
    return partes.length ? partes.join(' · ') : 'Opcional';
  }

  protected async registrar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { dia, series, repeticiones, peso, descansoMin, rpe, nota } = this.form.getRawValue();
    await this.guardar({
      dia,
      series: series ?? 0,
      repeticiones: repeticiones ?? 0,
      peso: peso ?? 0,
      descansoMin: descansoMin ?? 0,
      rpe: rpeONull(rpe),
      nota: notaONull(nota),
    });
  }

  /** Guarda otra vez la última serie, con fecha de hoy. El RPE y la nota no se repiten. */
  protected async repetirUltima(): Promise<void> {
    const ultima = this.ultima();
    if (!ultima) {
      return;
    }
    const { series, repeticiones, peso, descansoMin } = ultima;
    const dia = diaLocal(new Date());
    await this.guardar({ dia, series, repeticiones, peso, descansoMin, rpe: null, nota: null });
  }

  protected irALogin(): void {
    const returnUrl = this.router.url;
    this.dialogRef.close(false);
    void this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  protected cerrar(): void {
    this.dialogRef.close(false);
  }

  private async guardar(serie: NuevaSerie): Promise<void> {
    this.enviando.set(true);
    try {
      if (this.editando) {
        await this.registros.actualizarSerie(this.ejercicio.id, this.editando.id, serie);
        this.toasts.exito('Serie actualizada.');
      } else {
        const record = esNuevoRecord(this.anteriores(), serie);
        await this.registros.agregarSerie(this.ejercicio, serie);
        if (record) {
          this.toasts.exito(`¡Nuevo récord en ${this.ejercicio.nombre}! ${marca(serie)}`, 6000);
        } else {
          this.toasts.exito('¡Serie registrada con éxito!', 5000);
        }
      }
      this.dialogRef.close(true);
    } catch {
      this.toasts.error(
        this.editando
          ? 'No se pudo actualizar la serie. Puede que se haya borrado desde otro dispositivo.'
          : 'Hubo un error al registrar la serie, intenta de nuevo.',
      );
    } finally {
      this.enviando.set(false);
    }
  }
}

/** "80 kg × 5", o "12 repeticiones" en ejercicios sin carga. */
function marca({ peso, repeticiones }: NuevaSerie): string {
  return peso > 0 ? `${peso.toLocaleString('es')} kg × ${repeticiones}` : `${repeticiones} repeticiones`;
}
