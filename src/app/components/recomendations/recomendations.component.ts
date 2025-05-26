import { Component } from '@angular/core';
import { ExerciceCardComponent } from '../../modules/exercice-card/exercice-card.component';

@Component({
  selector: 'app-recomendations',
  standalone: true,
  imports: [ExerciceCardComponent],
  templateUrl: './recomendations.component.html',
  styleUrl: './recomendations.component.scss'
})
export class RecomendationsComponent {
  musculos = ['ESPALDA','PECHO', 'HOMBROS', 'TRICEPS', 'BICEPS', 'ANTEBRAZOS', 'LUMBARES', 'ABDOMINALES', 'PIERNAS'];
  musculoSeleccionado = 'Espalda';
  
  seleccionarMusculo(musculo: string): void {
    this.musculoSeleccionado = musculo;
  }

  volver() {
    window.history.back(); // Navega a la página anterior
  }

  irPerfiloLogin(){
    //Logica con firebase si se ha autenticado
  }

  ejercicios = [
    {
      nombre: 'Elevaciones laterales con mancuernas',
      series: 4,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Press militar con barra',
      series: 3,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Remo con mancuerna',
      series: 5,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Curl de bíceps con barra',
      series: 3,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Extensión de tríceps en polea',
      series: 4,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Sentadillas con barra',
      series: 5,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Peso muerto rumano',
      series: 4,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Press banca',
      series: 3,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Pull-over con mancuerna',
      series: 3,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Face pulls',
      series: 4,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Zancadas con mancuernas',
      series: 3,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Press Arnold',
      series: 3,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Remo en polea baja',
      series: 4,
      imagen: 'https://placehold.co/67x67'
    },
    {
      nombre: 'Dominadas asistidas',
      series: 3,
      imagen: 'https://placehold.co/67x67'
    }
  ];
}
