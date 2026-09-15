import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { type EjercicioRegistrable, type RegistroEjercicio, type Serie } from '../domain/registro.model';
import { type DatosSerieDialog, RegistrarSerieDialog } from './registrar-serie-dialog';

/** Abre la ventana de registrar o editar serie. Resuelve `true` si se guardó. */
@Injectable({ providedIn: 'root' })
export class RegistrarSerieService {
  private readonly dialog = inject(Dialog);

  abrir(ejercicio: EjercicioRegistrable): Promise<boolean> {
    return this.abrirDialogo({ ejercicio });
  }

  editar(registro: RegistroEjercicio, serie: Serie): Promise<boolean> {
    const ejercicio: EjercicioRegistrable = { id: registro.ejercicioId, nombre: registro.nombre, imagenFinal: registro.imagen };
    return this.abrirDialogo({ ejercicio, serie });
  }

  private async abrirDialogo(data: DatosSerieDialog): Promise<boolean> {
    const ref = this.dialog.open<boolean, DatosSerieDialog>(RegistrarSerieDialog, {
      data,
      ariaLabelledBy: 'serie-titulo',
      panelClass: 'gt-dialog-panel',
      backdropClass: 'gt-dialog-backdrop',
      width: 'min(100vw, 30rem)',
      maxWidth: '100vw',
    });
    return (await firstValueFrom(ref.closed)) === true;
  }
}
