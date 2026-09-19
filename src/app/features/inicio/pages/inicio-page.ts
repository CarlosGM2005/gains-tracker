import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoStore, RECOMENDADOS_EN_INICIO } from '@features/ejercicios/public-api';
import { Carousel } from '@shared/ui/carousel/carousel';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { Reveal } from '@shared/ui/reveal/reveal';
import { Skeleton } from '@shared/ui/skeleton/skeleton';
import { tomarAleatorios } from '@shared/utils/shuffle';

import {
  DIAS_POR_DEFECTO,
  type DiasPorSemana,
  esDiasPorSemana,
  indiceRutinaDeHoy,
  RUTINAS,
} from '../domain/rutina';
import { PlanDias } from '../ui/plan-dias';
import { RecomendadoTile } from '../ui/recomendado-tile';
import { RutinaDia } from '../ui/rutina-dia';

/** Clave de localStorage con los días por semana elegidos (preferencia de este navegador). */
const CLAVE_DIAS = 'gt.rutina.dias';

@Component({
  selector: 'app-inicio-page',
  imports: [RouterLink, PageHeader, Carousel, EmptyState, Skeleton, Reveal, RecomendadoTile, RutinaDia, PlanDias],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.scss',
})
export class InicioPage {
  private readonly catalogo = inject(CatalogoStore);
  private readonly almacen = inject(DOCUMENT).defaultView?.localStorage;

  /** Días que entrena el usuario: elige el plan del carrusel. Se recuerda en este navegador. */
  protected readonly dias = signal<DiasPorSemana>(this.leerDias());
  protected readonly rutina = computed(() => RUTINAS[this.dias()]);
  /** Día del plan que toca hoy (-1 si hoy se descansa): el carrusel empieza en él y lo marca. */
  protected readonly hoy = computed(() => indiceRutinaDeHoy(this.rutina(), new Date()));
  /** Huecos del esqueleto mientras cargan los recomendados. */
  protected readonly huecos = Array.from({ length: RECOMENDADOS_EN_INICIO });

  // La lista completa queda en caché y la reutilizan los recomendados por músculo.
  protected readonly recomendados = resource({
    loader: async () => tomarAleatorios(await this.catalogo.recomendados(), RECOMENDADOS_EN_INICIO),
  });

  protected cambiarDias(dias: DiasPorSemana): void {
    this.dias.set(dias);
    try {
      this.almacen?.setItem(CLAVE_DIAS, String(dias));
    } catch {
      // Sin almacenamiento (modo privado, bloqueado): la elección vale solo para esta visita.
    }
  }

  private leerDias(): DiasPorSemana {
    try {
      const guardado = Number(this.almacen?.getItem(CLAVE_DIAS));
      return esDiasPorSemana(guardado) ? guardado : DIAS_POR_DEFECTO;
    } catch {
      return DIAS_POR_DEFECTO;
    }
  }
}
