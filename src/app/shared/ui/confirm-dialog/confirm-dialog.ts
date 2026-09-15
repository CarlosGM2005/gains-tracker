import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje: string;
  /** Texto del botón que confirma (p. ej. "Borrar"). */
  confirmar: string;
  /** Pinta el botón en rojo: la acción no se puede deshacer. */
  peligro?: boolean;
}

/** Ventana de confirmación. El foco empieza en "Cancelar" para que Enter no confirme por accidente. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dialog">
      <h2 id="confirm-titulo" class="dialog__title">{{ opciones.titulo }}</h2>
      <p id="confirm-mensaje" class="dialog__text">{{ opciones.mensaje }}</p>
      <div class="dialog__actions">
        <button type="button" class="btn btn--ghost" cdkFocusInitial (click)="ref.close(false)">Cancelar</button>
        <button
          type="button"
          class="btn"
          [class.btn--danger]="opciones.peligro"
          [class.btn--primary]="!opciones.peligro"
          (click)="ref.close(true)"
        >
          {{ opciones.confirmar }}
        </button>
      </div>
    </section>
  `,
})
export class ConfirmDialog {
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly opciones = inject<OpcionesConfirmacion>(DIALOG_DATA);
}

/** Pide confirmación antes de una acción. Resuelve `true` solo si se pulsa el botón de confirmar. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(Dialog);

  async confirmar(opciones: OpcionesConfirmacion): Promise<boolean> {
    const ref = this.dialog.open<boolean, OpcionesConfirmacion>(ConfirmDialog, {
      data: opciones,
      role: 'alertdialog',
      ariaLabelledBy: 'confirm-titulo',
      ariaDescribedBy: 'confirm-mensaje',
      panelClass: 'gt-dialog-panel',
      backdropClass: 'gt-dialog-backdrop',
      width: 'min(100vw, 26rem)',
      maxWidth: '100vw',
    });
    return (await firstValueFrom(ref.closed)) === true;
  }
}
