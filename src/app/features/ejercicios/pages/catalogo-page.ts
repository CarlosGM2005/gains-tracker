import { ChangeDetectionStrategy, Component, computed, inject, input, resource } from '@angular/core';
import { Router } from '@angular/router';

import { ChipGroup } from '@shared/ui/chip-group/chip-group';
import { PageHeader } from '@shared/ui/page-header/page-header';

import {
  ETIQUETA_MUSCULO,
  ETIQUETA_NIVEL,
  esMusculo,
  type Musculo,
  MUSCULO_POR_DEFECTO,
  type Nivel,
} from '../domain/ejercicio.model';
import { CatalogoStore } from '../state/catalogo-store';
import { EjerciciosListado, estadoListado } from '../ui/ejercicios-listado';
import { OPCIONES_MUSCULO } from '../ui/opciones-musculo';

@Component({
  selector: 'app-catalogo-page',
  imports: [PageHeader, ChipGroup, EjerciciosListado],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header titulo="Ejercicios" [antetitulo]="'Nivel ' + etiquetaNivel()" />

      <div class="catalogo">
        <app-chip-group
          etiqueta="Músculo"
          [opciones]="opciones"
          [seleccionado]="musculoActivo()"
          (seleccionadoChange)="cambiarMusculo($event)"
        />

        <app-ejercicios-listado
          [estado]="estado()"
          [ejercicios]="ejercicios.hasValue() ? ejercicios.value() : []"
          [resumen]="'Ejercicios de ' + etiquetaMusculo() + ' - nivel ' + nivel()"
          [textoVacio]="'No hay ejercicios disponibles para ' + etiquetaMusculo() + ' en nivel ' + nivel()"
          (reintentar)="ejercicios.reload()"
        />
      </div>
    </div>
  `,
  styles: `
    .catalogo {
      display: grid;
      gap: var(--space-6);
    }
  `,
})
export class CatalogoPage {
  private readonly catalogo = inject(CatalogoStore);
  private readonly router = inject(Router);

  /** Path param, ya validado y en minúsculas por `nivelValidoGuard`. */
  readonly nivel = input.required<Nivel>();
  /** Query param `?musculo=`. */
  readonly musculo = input<string>();

  protected readonly opciones = OPCIONES_MUSCULO;
  protected readonly musculoActivo = computed<Musculo>(() => {
    const valor = this.musculo();
    return esMusculo(valor) ? valor : MUSCULO_POR_DEFECTO;
  });
  protected readonly etiquetaMusculo = computed(() => ETIQUETA_MUSCULO[this.musculoActivo()]);
  protected readonly etiquetaNivel = computed(() => ETIQUETA_NIVEL[this.nivel()]);

  protected readonly ejercicios = resource({
    params: () => ({ nivel: this.nivel(), musculo: this.musculoActivo() }),
    loader: ({ params }) => this.catalogo.porNivelYMusculo(params.nivel, params.musculo),
  });
  protected readonly estado = computed(() => estadoListado(this.ejercicios));

  /** Cambia el músculo en la URL sin añadir historial: "Volver" regresa a la elección de nivel. */
  protected cambiarMusculo(musculo: Musculo): void {
    void this.router.navigate([], { queryParams: { musculo }, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
