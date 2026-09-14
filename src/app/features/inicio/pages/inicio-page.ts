import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogoStore, RECOMENDADOS_EN_INICIO } from '@features/ejercicios/public-api';
import { type CarouselSlide, Carousel } from '@shared/ui/carousel/carousel';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { Reveal } from '@shared/ui/reveal/reveal';
import { Spinner } from '@shared/ui/spinner/spinner';
import { tomarAleatorios } from '@shared/utils/shuffle';

import { RecomendadoTile } from '../ui/recomendado-tile';

/** Rutinas del carrusel: mismas imágenes y orden que la app actual (el móvil repite dos). */
const RUTINAS: readonly CarouselSlide[] = [
  { srcEscritorio: 'carrusel/Dia1_pc.png', srcMovil: 'carrusel/Pecho_Movil.png', alt: 'Rutina del día 1' },
  { srcEscritorio: 'carrusel/Dia2_pc.png', srcMovil: 'carrusel/Piernas_Movil.png', alt: 'Rutina del día 2' },
  { srcEscritorio: 'carrusel/Dia3_pc.png', srcMovil: 'carrusel/Espalda_Movil.png', alt: 'Rutina del día 3' },
  { srcEscritorio: 'carrusel/Dia4_pc.png', srcMovil: 'carrusel/Pecho_Movil.png', alt: 'Rutina del día 4' },
  { srcEscritorio: 'carrusel/Dia5_pc.png', srcMovil: 'carrusel/Piernas_Movil_2.png', alt: 'Rutina del día 5' },
  { srcEscritorio: 'carrusel/Dia6_pc.png', srcMovil: 'carrusel/Espalda_Movil.png', alt: 'Rutina del día 6' },
];

@Component({
  selector: 'app-inicio-page',
  imports: [RouterLink, PageHeader, Carousel, EmptyState, Spinner, Reveal, RecomendadoTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.scss',
})
export class InicioPage {
  private readonly catalogo = inject(CatalogoStore);

  protected readonly rutinas = RUTINAS;

  // La lista completa queda en caché y la reutilizan los recomendados por músculo.
  protected readonly recomendados = resource({
    loader: async () => tomarAleatorios(await this.catalogo.recomendados(), RECOMENDADOS_EN_INICIO),
  });
}
