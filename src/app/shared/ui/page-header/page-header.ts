import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BackButton } from '../back-button/back-button';

/**
 * Cabecera de página: volver, título grande condensado y una zona de acciones a la derecha
 * (proyectar con `<ng-content select="[headerActions]">`).
 */
@Component({
  selector: 'app-page-header',
  imports: [BackButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly titulo = input.required<string>();
  /** Texto pequeño sobre el título (p. ej. "Nivel avanzado"). */
  readonly antetitulo = input<string>();
  readonly mostrarVolver = input(true);
}
