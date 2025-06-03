import { Component, OnInit } from '@angular/core';
import { BarraNavegacionComponent } from '../barra-navegacion/barra-navegacion.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Ejercicio } from '../../interfaces/ejercicio.interface';
import { EjerciciosService } from '../../services/ejercicios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [BarraNavegacionComponent, RouterLink, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private userSub?: Subscription;
  ejerciciosRecomendados: Ejercicio[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private ejercicioService: EjerciciosService
  ) {}


  ngOnInit(): void {
    this.ejercicioService.getEjerciciosRecomendados().subscribe(ejercicios => {
      this.ejerciciosRecomendados = ejercicios;
    });
  }

  volver() {
    window.history.back();
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
