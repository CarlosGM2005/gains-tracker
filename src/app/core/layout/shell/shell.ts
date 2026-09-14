import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { ToastOutlet } from '../../notifications/toast-outlet';
import { BottomNav } from '../nav/bottom-nav';
import { SideNav } from '../nav/side-nav';
import { type NavMode, navModeDe } from '../route-data';

/**
 * Layout único de la app. Sustituye a AuthLayout y MainLayout: cada ruta declara `data.nav`
 * y el shell decide qué barras pinta. Qué barra se ve según el ancho lo resuelve el CSS.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SideNav, BottomNav, ToastOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  host: {
    '[attr.data-nav]': 'nav()',
  },
})
export class Shell {
  private readonly router = inject(Router);

  protected readonly nav = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((): NavMode => navModeDe(this.router.routerState.snapshot.root)),
    ),
    { initialValue: navModeDe(this.router.routerState.snapshot.root) },
  );
}
