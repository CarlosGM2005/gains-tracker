import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Marquee } from '@shared/ui/marquee/marquee';

@Component({
  selector: 'app-bienvenida-page',
  imports: [RouterLink, Marquee],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bienvenida-page.html',
  styleUrl: './bienvenida-page.scss',
})
export class BienvenidaPage {
  /** Cinta de arriba: el lema, en grande. */
  protected readonly lema = [
    'Mide',
    'Mejora',
    'Supera tus límites',
    'Entrena con cabeza',
    'Cada serie cuenta',
    'Sin excusas',
  ];

  /** Cinta de abajo, en sentido contrario: qué puedes hacer en la app. */
  protected readonly funciones = [
    'Ejercicios por músculo',
    'Tres niveles',
    'Registra tus series',
    'Mira tu progreso',
    'Guarda tus favoritos',
    'Rutina semanal',
  ];
}
