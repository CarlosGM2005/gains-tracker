import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoStore, type Ejercicio, EjerciciosListado, type EstadoListado } from '@features/ejercicios/public-api';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';

import { FavoritosStore } from '../state/favoritos-store';

/**
 * Ejercicios marcados con la estrella. Los datos salen del catálogo en caché (una sola lectura) y se
 * muestran del último marcado al primero. Un id que ya no existe en el catálogo se ignora.
 */
@Component({
  selector: 'app-favoritos-page',
  imports: [RouterLink, PageHeader, EmptyState, EjerciciosListado],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header titulo="Favoritos" antetitulo="Tu selección" />

      @if (estado() === 'listo' && favoritos().length === 0) {
        <app-empty-state
          titulo="Todavía no tienes favoritos"
          detalle="Pulsa la estrella en cualquier ejercicio para tenerlo siempre a mano."
        >
          <a class="btn btn--primary" routerLink="/buscar">Buscar ejercicios</a>
        </app-empty-state>
      } @else {
        <app-ejercicios-listado
          [estado]="estado()"
          [ejercicios]="favoritos()"
          resumen="Ejercicios favoritos"
          textoVacio="Todavía no tienes favoritos"
          (reintentar)="catalogo.reload()"
        />
      }
    </div>
  `,
})
export class FavoritosPage {
  private readonly store = inject(FavoritosStore);
  private readonly catalogoStore = inject(CatalogoStore);

  protected readonly catalogo = resource({ loader: () => this.catalogoStore.todos() });

  protected readonly estado = computed<EstadoListado>(() => {
    if (this.catalogo.error() || this.store.error()) {
      return 'error';
    }
    return this.catalogo.hasValue() && !this.store.cargando() ? 'listo' : 'cargando';
  });

  protected readonly favoritos = computed<Ejercicio[]>(() => {
    if (!this.catalogo.hasValue()) {
      return [];
    }
    const porId = new Map(this.catalogo.value().map((e) => [e.id, e]));
    return [...this.store.ids()]
      .reverse()
      .map((id) => porId.get(id))
      .filter((e): e is Ejercicio => !!e);
  });
}
