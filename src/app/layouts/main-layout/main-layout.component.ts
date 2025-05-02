import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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

  readonly showSidebar = computed(() => {
    const currentUrl = this.router.url;
    const isExcluded = this.excludeRoutes.some(route => currentUrl.includes(route));
    const isDesktop = window.innerWidth >= 992;
    return !(isExcluded && isDesktop);
  });

  getAnimationData(): string {
    return this.router.url;
  }
}
