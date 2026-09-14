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
  protected readonly lema = ['Mide', 'Mejora', 'Supera tus límites'];
}
