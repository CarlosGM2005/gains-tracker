import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { BarraNavegacionComponent } from '../../components/barra-navegacion/barra-navegacion.component';
import { NgClass } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, BarraNavegacionComponent, NgClass],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({ position: 'absolute', width: '100%' })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('200ms ease-out', style({ opacity: 0 }))
          ], { optional: true }),
          query(':enter', [
            style({ opacity: 0 }),
            animate('200ms ease-in', style({ opacity: 1 }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class MainLayoutComponent {
  private router = inject(Router);
  private excludeRoutes = ['basic-profile', 'data-profile'];

  private url = signal(this.router.url);
  private screenWidth = signal(window.innerWidth);

  readonly showSidebar = signal(this.shouldShowSidebar());

  constructor() {
    // 🔁 Detectar cambio de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.url.set(this.router.url);
      this.updateSidebar();
    });

    // 🪟 Detectar cambio de tamaño de pantalla
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
      this.updateSidebar();
    });
  }

  private shouldShowSidebar(): boolean {
    const currentUrl = this.url();
    const isExcluded = this.excludeRoutes.some(route => currentUrl.includes(route));
    const isDesktop = this.screenWidth() >= 992;
    return !(isExcluded && isDesktop);
  }

  private updateSidebar() {
    this.showSidebar.set(this.shouldShowSidebar());
  }

  getAnimationData(): string {
    return this.router.url;
  }
}
