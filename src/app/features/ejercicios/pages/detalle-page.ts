import { ChangeDetectionStrategy, Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RegistrarSerieService } from '@features/registros/public-api';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { Spinner } from '@shared/ui/spinner/spinner';

import { type Ejercicio, ETIQUETA_MUSCULO, ETIQUETA_NIVEL } from '../domain/ejercicio.model';
import { CatalogoStore } from '../state/catalogo-store';

@Component({
  selector: 'app-detalle-page',
  imports: [RouterLink, PageHeader, EmptyState, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detalle-page.html',
  styleUrl: './detalle-page.scss',
})
export class DetallePage {
  private readonly catalogo = inject(CatalogoStore);
  private readonly registrarSerie = inject(RegistrarSerieService);

  /** Path param `:id` (id del documento, no el nombre). */
  readonly id = input.required<string>();

  protected readonly etiquetaMusculo = ETIQUETA_MUSCULO;
  protected readonly etiquetaNivel = ETIQUETA_NIVEL;

  protected readonly ejercicio = resource({
    params: () => this.id(),
    loader: ({ params }) => this.catalogo.porId(params),
  });

  protected abrirRegistro(ejercicio: Ejercicio): void {
    void this.registrarSerie.abrir(ejercicio);
  }
}
