import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExerciceCardComponent } from '../../modules/exercice-card/exercice-card.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exercices',
  standalone: true,
  imports: [ExerciceCardComponent],
  templateUrl: './exercices.component.html',
  styleUrl: './exercices.component.scss'
})
export class ExercicesComponent implements OnInit {
  musculos = ['Espalda', 'Pecho', 'Hombros', 'Triceps', 'Biceps', 'Antebrazos', 'Lumbares', 'Abdominales', 'Piernas'];
  musculoSeleccionado = 'Espalda';
  nivelSeleccionado: string = "";
   private userSub?: Subscription;


  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.nivelSeleccionado = this.route.snapshot.paramMap.get('level')!;

    if (!['Avanzado', 'Intermedio', 'Principiante'].includes(this.nivelSeleccionado)) {
      // Si no es un nivel válido, redirige al usuario a '/main'
      this.router.navigate(['/main']);
    }
  }

  //Llamar al servicio encargado de traerme los datos de los ejercicios
  seleccionarMusculo(musculo: string): void {
    this.musculoSeleccionado = musculo;
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

  ejercicios = [
    {
      nombre: 'Elevaciones laterales con mancuernas',
      series: 4,
      imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Press militar con barra',
      series: 3,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Remo con mancuerna',
      series: 5,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Curl de bíceps con barra',
      series: 3,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Extensión de tríceps en polea',
      series: 4,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Sentadillas con barra',
      series: 5,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Peso muerto rumano',
      series: 4,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Press banca',
      series: 3,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Pull-over con mancuerna',
      series: 3,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Face pulls',
      series: 4,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Zancadas con mancuernas',
      series: 3,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Press Arnold',
      series: 3,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Remo en polea baja',
      series: 4,
       imagenInicio: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Dominadas asistidas',
      series: 3,
       imagenInicio: 'https://placehold.co/67x67'
    }
  ];

}

