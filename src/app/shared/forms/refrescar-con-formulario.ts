import { ChangeDetectorRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type AbstractControl } from '@angular/forms';

/**
 * En zoneless + OnPush, un cambio del formulario hecho por código (reset, setValue, estado tras
 * una petición) no repinta la vista. Llamar en el constructor del componente que pinta el form.
 */
export function refrescarConFormulario(form: AbstractControl): void {
  const cdr = inject(ChangeDetectorRef);
  form.events.pipe(takeUntilDestroyed()).subscribe(() => cdr.markForCheck());
}
