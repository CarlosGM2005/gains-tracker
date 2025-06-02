import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExerciceCardComponent } from '../../modules/exercice-card/exercice-card.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { EjerciciosService } from '../../services/ejercicios.service';
import { Ejercicio } from '../../interfaces/ejercicio.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recomendations',
   standalone: true,
  imports: [ExerciceCardComponent, CommonModule],
  templateUrl: './recomendations.component.html',
  styleUrls: ['./recomendations.component.scss']
})

export class RecomendationsComponent implements OnInit {
  musculos = ['Espalda', 'Pecho', 'Hombros', 'Triceps', 'Biceps', 'Antebrazos', 'Lumbares', 'Abdominales', 'Piernas'];
  musculoSeleccionado = 'Espalda';
  ejerciciosFiltrados: Ejercicio[] = [];
  private userSub?: Subscription;

  constructor(private ejerciciosService: EjerciciosService, private router: Router, private authService: AuthService,) {}

  ngOnInit(): void {
    this.cargarEjercicios();
  }

  seleccionarMusculo(musculo: string): void {
    this.musculoSeleccionado = musculo;
    this.cargarEjercicios();
  }

  cargarEjercicios(): void {
    // Asumo que getEjerciciosRecomendadosPorMusculo devuelve un Observable<Ejercicio[]>
    this.ejerciciosService.getEjerciciosRecomendadosPorMusculo(this.musculoSeleccionado.toLowerCase())
      .subscribe({
        next: (ejercicios) => {
          this.ejerciciosFiltrados = ejercicios;
        },
        error: (error) => {
          console.error('Error cargando ejercicios recomendados:', error);
          this.ejerciciosFiltrados = [];
        }
      });
  }

  volver(): void {
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
