import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { Spinner } from '@shared/ui/spinner/spinner';

import { RegistrosStore } from '../state/registros-store';
import { RegistroCard } from '../ui/registro-card';

@Component({
  selector: 'app-registros-page',
  imports: [RouterLink, PageHeader, EmptyState, Spinner, RegistroCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header titulo="Mis ejercicios" antetitulo="Tu progreso" />

      @if (store.error()) {
        <app-empty-state tipo="error" titulo="No se pudieron cargar tus registros" detalle="Inténtalo más tarde." />
      } @else if (store.cargando()) {
        <app-spinner etiqueta="Cargando registros" />
      } @else if (store.registros().length === 0) {
        <app-empty-state titulo="No tienes registros guardados" detalle="Abre un ejercicio y registra tu primera serie.">
          <a class="btn btn--primary" routerLink="/ejercicios">Explorar ejercicios</a>
        </app-empty-state>
      } @else {
        <ul class="lista">
          @for (registro of store.registros(); track registro.ejercicioId; let i = $index) {
            <li class="stagger" [style.--i]="i">
              <app-registro-card
                [registro]="registro"
                [abierto]="abiertoId() === registro.ejercicioId"
                (alternar)="alternar(registro.ejercicioId)"
              />
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .lista {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    @media (width >= 992px) {
      .lista {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
        gap: var(--space-4);
      }
    }
  `,
})
export class RegistrosPage {
  protected readonly store = inject(RegistrosStore);

  /** Acordeón: solo una tarjeta abierta. Estado visual local (ya no se guarda en Firestore). */
  protected readonly abiertoId = signal<string | null>(null);

  protected alternar(ejercicioId: string): void {
    this.abiertoId.update((actual) => (actual === ejercicioId ? null : ejercicioId));
  }
}
