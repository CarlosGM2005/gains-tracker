import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ToastService } from '@core/notifications/toast.service';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { Spinner } from '@shared/ui/spinner/spinner';

import { type RegistroEjercicio, type Serie } from '../domain/registro.model';
import { RegistrosStore } from '../state/registros-store';
import { RegistrarSerieService } from '../ui/registrar-serie.service';
import { RegistroCard } from '../ui/registro-card';

@Component({
  selector: 'app-registros-page',
  imports: [RouterLink, PageHeader, EmptyState, Spinner, RegistroCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header titulo="Mis ejercicios" antetitulo="Tu progreso">
        <a headerActions class="btn btn--ghost" routerLink="/estadisticas">
          <img src="icons/logoEstadisticas.png" alt="" width="20" height="20" />
          Estadísticas
        </a>
      </app-page-header>

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
                (editar)="editar(registro, $event)"
                (borrar)="borrar(registro, $event)"
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
  private readonly dialogoSerie = inject(RegistrarSerieService);
  private readonly confirmacion = inject(ConfirmService);
  private readonly toasts = inject(ToastService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly store = inject(RegistrosStore);

  /** Acordeón: solo una tarjeta abierta. Estado visual local (ya no se guarda en Firestore). */
  protected readonly abiertoId = signal<string | null>(null);

  protected alternar(ejercicioId: string): void {
    this.abiertoId.update((actual) => (actual === ejercicioId ? null : ejercicioId));
  }

  protected editar(registro: RegistroEjercicio, serie: Serie): void {
    void this.dialogoSerie.editar(registro, serie);
  }

  protected async borrar(registro: RegistroEjercicio, serie: Serie): Promise<void> {
    const ultima = registro.series.length === 1;
    const confirmado = await this.confirmacion.confirmar({
      titulo: '¿Borrar la serie?',
      mensaje:
        `${registro.nombre}, ${formatDate(serie.dia, 'd MMM y', this.locale)}: ${serie.series} × ${serie.repeticiones} con ${serie.peso} kg.` +
        (ultima ? ' Es la única serie de este ejercicio, así que desaparecerá de tus registros.' : '') +
        ' No se puede deshacer.',
      confirmar: 'Borrar',
      peligro: true,
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.store.borrarSerie(registro.ejercicioId, serie.id);
      this.toasts.exito('Serie borrada.');
    } catch {
      this.toasts.error('No se pudo borrar la serie. Inténtalo de nuevo.');
    }
  }
}
