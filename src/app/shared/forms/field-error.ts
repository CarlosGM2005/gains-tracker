import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { type AbstractControl, type ValidationErrors } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';

/** Mensajes por clave de error de Angular (`required`, `min`, `pattern`...). */
export type MensajesDeError = Readonly<Record<string, string>>;

/**
 * Muestra el primer error de un control cuando ya se ha tocado o modificado.
 * Se suscribe a los eventos del control porque su referencia no cambia al validar.
 */
@Component({
  selector: 'app-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mensaje(); as texto) {
      <p class="field-error" [id]="idError()" role="alert">{{ texto }}</p>
    }
  `,
  styles: `
    .field-error {
      margin-top: var(--space-1);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-danger);
    }
  `,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();
  readonly mensajes = input.required<MensajesDeError>();
  /** Id para enlazarlo desde el input con `aria-describedby`. */
  readonly idError = input.required<string>();

  private readonly errores = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) =>
        control.events.pipe(
          startWith(null),
          map((): ValidationErrors | null => (control.invalid && (control.touched || control.dirty) ? control.errors : null)),
        ),
      ),
    ),
    { initialValue: null },
  );

  protected readonly mensaje = computed(() => {
    const errores = this.errores();
    if (!errores) {
      return null;
    }
    const mensajes = this.mensajes();
    const clave = Object.keys(errores).find((k) => mensajes[k]);
    return clave ? (mensajes[clave] ?? null) : null;
  });
}
