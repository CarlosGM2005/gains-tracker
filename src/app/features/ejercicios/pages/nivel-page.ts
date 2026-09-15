import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PageHeader } from '@shared/ui/page-header/page-header';

import { ETIQUETA_NIVEL, type Nivel, NIVEL_POR_DEFECTO, NIVELES } from '../domain/ejercicio.model';

const DESCRIPCION_NIVEL: Readonly<Record<Nivel, string>> = {
  principiante: 'Técnica básica y cargas ligeras para empezar con buen pie.',
  intermedio: 'Más volumen y ejercicios compuestos para seguir progresando.',
  avanzado: 'Alta intensidad y técnica exigente para superar tus límites.',
};

@Component({
  selector: 'app-nivel-page',
  imports: [RouterLink, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nivel-page.html',
  styleUrl: './nivel-page.scss',
})
export class NivelPage {
  private readonly router = inject(Router);

  protected readonly niveles = NIVELES;
  protected readonly etiquetas = ETIQUETA_NIVEL;
  protected readonly descripciones = DESCRIPCION_NIVEL;
  protected readonly seleccionado = signal<Nivel>(NIVEL_POR_DEFECTO);

  protected continuar(): void {
    void this.router.navigate(['/ejercicios', this.seleccionado()]);
  }
}
