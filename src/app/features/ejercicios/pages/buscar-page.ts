import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, resource } from '@angular/core';
import { Router } from '@angular/router';

import { type ChipOption, ChipGroup } from '@shared/ui/chip-group/chip-group';
import { PageHeader } from '@shared/ui/page-header/page-header';

import { buscarEjercicios, type FiltroMusculo } from '../domain/busqueda';
import { esMusculo } from '../domain/ejercicio.model';
import { CatalogoStore } from '../state/catalogo-store';
import { EjerciciosListado, estadoListado } from '../ui/ejercicios-listado';
import { OPCIONES_MUSCULO } from '../ui/opciones-musculo';

const OPCIONES: readonly ChipOption<FiltroMusculo>[] = [{ valor: 'todos', etiqueta: 'Todos' }, ...OPCIONES_MUSCULO];

/**
 * Buscador del catálogo. Carga la colección una vez (caché del `CatalogoStore`) y filtra en memoria
 * mientras se escribe. El término y el músculo viven en la URL (`?q=&musculo=`) para poder compartirla.
 */
@Component({
  selector: 'app-buscar-page',
  imports: [PageHeader, ChipGroup, EjerciciosListado],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header titulo="Buscar" antetitulo="Todo el catálogo" />

      <div class="buscar">
        <form class="buscar__form" role="search" (submit)="$event.preventDefault()">
          <label class="visually-hidden" for="buscar-termino">Buscar ejercicios</label>
          <span class="buscar__icono" aria-hidden="true">
            <img src="icons/logoBuscar.png" alt="" width="20" height="20" />
          </span>
          <input
            #campo
            id="buscar-termino"
            class="input buscar__input"
            type="search"
            enterkeyhint="search"
            autocomplete="off"
            placeholder="Nombre o músculo (p. ej. press, glúteos)"
            [value]="termino()"
            (input)="escribir(campo.value)"
          />
        </form>

        <app-chip-group
          etiqueta="Músculo"
          [opciones]="opciones"
          [seleccionado]="musculoActivo()"
          (seleccionadoChange)="cambiarMusculo($event)"
        />

        <app-ejercicios-listado
          [estado]="estado()"
          [ejercicios]="resultados()"
          [resumen]="resumen()"
          [textoVacio]="'No hay ejercicios que coincidan con «' + termino().trim() + '»'"
          (reintentar)="catalogo.reload()"
        />
      </div>
    </div>
  `,
  styles: `
    .buscar {
      display: grid;
      gap: var(--space-6);
    }

    .buscar__form {
      position: relative;
    }

    .buscar__icono {
      position: absolute;
      top: 50%;
      left: var(--space-4);
      display: grid;
      opacity: 0.7;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .buscar__input {
      padding-left: calc(var(--space-4) * 2 + 20px);
      font-size: var(--font-size-lg);
    }
  `,
})
export class BuscarPage {
  private readonly store = inject(CatalogoStore);
  private readonly router = inject(Router);

  /** Query params `?q=` y `?musculo=`. */
  readonly q = input<string>();
  readonly musculo = input<string>();

  protected readonly opciones = OPCIONES;
  /**
   * Término que se está escribiendo. Toma el valor inicial de la URL y después manda el campo: si
   * volviera a leer `q` tras cada navegación, una navegación lenta podría borrar la última letra.
   */
  protected readonly termino = linkedSignal<string | undefined, string>({
    source: () => this.q(),
    computation: (q, previo) => (previo ? previo.value : (q ?? '')),
  });
  protected readonly musculoActivo = computed<FiltroMusculo>(() => {
    const valor = this.musculo();
    return esMusculo(valor) ? valor : 'todos';
  });

  protected readonly catalogo = resource({ loader: () => this.store.todos() });
  protected readonly estado = computed(() => estadoListado(this.catalogo));
  protected readonly resultados = computed(() =>
    this.catalogo.hasValue() ? buscarEjercicios(this.catalogo.value(), this.termino(), this.musculoActivo()) : [],
  );
  protected readonly resumen = computed(() => {
    const termino = this.termino().trim();
    return termino ? `Resultados para «${termino}»` : 'Todos los ejercicios';
  });

  protected escribir(valor: string): void {
    this.termino.set(valor);
    this.actualizarUrl({ q: valor.trim() || null });
  }

  protected cambiarMusculo(musculo: FiltroMusculo): void {
    this.actualizarUrl({ musculo: musculo === 'todos' ? null : musculo });
  }

  /** Sin historial nuevo: "Volver" sale del buscador en lugar de deshacer letra a letra. */
  private actualizarUrl(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
