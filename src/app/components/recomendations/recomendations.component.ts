import { Component } from '@angular/core';

@Component({
  selector: 'app-recomendations',
  standalone: true,
  imports: [],
  templateUrl: './recomendations.component.html',
  styleUrl: './recomendations.component.scss'
})
export class RecomendationsComponent {
  musculos = ['ESPALDA','PECHO', 'HOMBROS', 'TRICEPS', 'BICEPS', 'ANTEBRAZOS', 'LUMBARES', 'ABDOMINALES', 'PIERNAS'];
    musculoSeleccionado = 'Espalda';
    nivelSeleccionado: string = "";

    seleccionarMusculo(musculo: string): void {
      this.musculoSeleccionado = musculo;
    }
}
