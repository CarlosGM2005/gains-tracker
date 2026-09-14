import { ChangeDetectionStrategy, Component, computed, inject, input, resource } from '@angular/core';
import { Router } from '@angular/router';

import { ChipGroup } from '@shared/ui/chip-group/chip-group';
import { PageHeader } from '@shared/ui/page-header/page-header';

import { ETIQUETA_MUSCULO, esMusculo, type Musculo, MUSCULO_POR_DEFECTO } from '../domain/ejercicio.model';
import { CatalogoStore } from '../state/catalogo-store';
import { EjerciciosListado, estadoListado } from '../ui/ejercicios-listado';
import { OPCIONES_MUSCULO } from '../ui/opciones-musculo';

@Component({
  selector: 'app-recomendados-page',
  imports: [PageHeader, ChipGroup, EjerciciosListado],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header titulo="Ejercicios recomendados" antetitulo="Selección GainsTracker" />

      <div class="recomendados">
        <app-chip-group
          etiqueta="Músculo"
          [opciones]="opciones"
          [seleccionado]="musculoActivo()"
          (seleccionadoChange)="cambiarMusculo($event)"
        />

        <app-ejercicios-listado
          [estado]="estado()"
          [ejercicios]="ejercicios.hasValue() ? ejercicios.value() : []"
          [resumen]="'Ejercicios recomendados de ' + etiquetaMusculo()"
          [textoVacio]="'No hay ejercicios recomendados para ' + etiquetaMusculo()"
          (reintentar)="ejercicios.reload()"
        />
      </div>
    </div>
  `,
  styles: `
    .recomendados {
      display: grid;
      gap: var(--space-6);
    }
  `,
})
export class RecomendadosPage {
  private readonly catalogo = inject(CatalogoStore);
  private readonly router = inject(Router);

  /** Query param `?musculo=`. */
  readonly musculo = input<string>();

  protected readonly opciones = OPCIONES_MUSCULO;
  protected readonly musculoActivo = computed<Musculo>(() => {
    const valor = this.musculo();
    return esMusculo(valor) ? valor : MUSCULO_POR_DEFECTO;
  });
  protected readonly etiquetaMusculo = computed(() => ETIQUETA_MUSCULO[this.musculoActivo()]);

  protected readonly ejercicios = resource({
    params: () => this.musculoActivo(),
    loader: ({ params }) => this.catalogo.recomendadosPorMusculo(params),
  });
  protected readonly estado = computed(() => estadoListado(this.ejercicios));

  protected cambiarMusculo(musculo: Musculo): void {
    void this.router.navigate([], { queryParams: { musculo }, replaceUrl: true });
  }
}
