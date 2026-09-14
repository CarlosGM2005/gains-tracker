import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { type EjercicioRegistrable } from '../domain/registro.model';
import { RegistrarSerieDialog } from './registrar-serie-dialog';

/** Abre la ventana de registrar serie. Resuelve `true` si se guardó una serie. */
@Injectable({ providedIn: 'root' })
export class RegistrarSerieService {
  private readonly dialog = inject(Dialog);

  async abrir(ejercicio: EjercicioRegistrable): Promise<boolean> {
    const ref = this.dialog.open<boolean, EjercicioRegistrable>(RegistrarSerieDialog, {
      data: ejercicio,
      ariaLabelledBy: 'serie-titulo',
      panelClass: 'gt-dialog-panel',
      backdropClass: 'gt-dialog-backdrop',
      width: 'min(100vw, 30rem)',
      maxWidth: '100vw',
    });
    return (await firstValueFrom(ref.closed)) === true;
  }
}
