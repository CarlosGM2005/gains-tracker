import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';

@Component({
  selector: 'app-barra-navegacion',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './barra-navegacion.component.html',
  styleUrl: './barra-navegacion.component.scss',
})
export class BarraNavegacionComponent {
  mostrarBarra = true;

  constructor(private router: Router) {
    this.checkRuta(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRuta(event.urlAfterRedirects);
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkRuta(this.router.url);
  }

  private checkRuta(ruta: string) {
    const rutasSinBarra = ['/main/basic-profile', '/main/data-profile'];
    const esEscritorio = window.innerWidth >= 992;
    this.mostrarBarra = !(esEscritorio && rutasSinBarra.includes(ruta));
  }
}
