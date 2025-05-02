import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BarraNavegacionComponent } from '../../components/barra-navegacion/barra-navegacion.component';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, BarraNavegacionComponent, NgClass],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private router = inject(Router);

  // Rutas donde NO queremos mostrar la barra lateral en escritorio
  private excludeRoutes = ['basic-profile', 'data-profile'];

  // Detecta si hay que mostrar la barra
  readonly showSidebar = computed(() => {
    const currentUrl = this.router.url;
    const isExcluded = this.excludeRoutes.some(route => currentUrl.includes(route));
    const isDesktop = window.innerWidth >= 992;
    return !(isExcluded && isDesktop);

  });
}
