import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExerciceCardComponent } from '../../modules/exercice-card/exercice-card.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { EjerciciosService } from '../../services/ejercicios.service';
import { Ejercicio } from '../../interfaces/ejercicio.interface';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-exercices',
  standalone: true,
  imports: [ExerciceCardComponent, CommonModule],
  templateUrl: './exercices.component.html',
  styleUrl: './exercices.component.scss'
})
export class ExercicesComponent implements OnInit {
  musculos = ['Espalda', 'Pecho', 'Hombros', 'Triceps', 'Biceps', 'Antebrazos', 'Abdominales', 'Piernas'];
  musculoSeleccionado = 'Espalda';
  nivelSeleccionado: string = "";
  private userSub?: Subscription;
  ejerciciosFiltrados: Ejercicio[] = [];



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private ejerciciosService: EjerciciosService
  ) { }


  ngOnInit(): void {
    const nivelParam = this.route.snapshot.paramMap.get('level');
    this.nivelSeleccionado = nivelParam ? nivelParam.toLowerCase() : '';

    if (!['avanzado', 'intermedio', 'principiante'].includes(this.nivelSeleccionado)) {
      this.router.navigate(['/main']);
      return;
    }

    // Cargar ejercicios de ESPALDA por defecto
    this.obtenerEjercicios('Espalda');
  }


  obtenerEjercicios(musculo: string) {
    this.musculoSeleccionado = musculo;

    if (!this.nivelSeleccionado || !['principiante', 'intermedio', 'avanzado'].includes(this.nivelSeleccionado.toLowerCase())) {
      console.warn('Nivel inválido o no seleccionado, usando nivel "intermedio" por defecto.');
      this.nivelSeleccionado = 'intermedio'; // o cualquier valor por defecto
    }

    this.ejerciciosService.getEjerciciosPorMusculoYNivel(musculo.toLowerCase(), this.nivelSeleccionado.toLowerCase())
      .subscribe({
        next: ejercicios => {
          this.ejerciciosFiltrados = ejercicios;
        },
        error: error => {
          console.error('Error en suscripción:', error);
        }
      });
  }


  //Llamar al servicio encargado de traerme los datos de los ejercicios
  seleccionarMusculo(musculo: string): void {
    this.obtenerEjercicios(musculo);
  }


  volver() {
    window.history.back(); // Navega a la página anterior
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

