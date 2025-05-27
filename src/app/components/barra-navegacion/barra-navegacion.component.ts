import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-barra-navegacion',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './barra-navegacion.component.html',
  styleUrl: './barra-navegacion.component.scss',
})
export class BarraNavegacionComponent {
  mostrarBarra = true;
   private userSub?: Subscription;

  constructor(private router: Router, private authService: AuthService) {
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

  irPerfiloLogin() {
    this.userSub = this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/main/basic-profile']);
      } else {
        this.router.navigate(['/main/login']);
      }
    });
  }
}
