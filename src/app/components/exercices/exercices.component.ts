import { Component } from '@angular/core';

@Component({
  selector: 'app-exercices',
  standalone: true,
  imports: [],
  templateUrl: './exercices.component.html',
  styleUrl: './exercices.component.scss'
})
export class ExercicesComponent {
  musculos = ['Espalda','Pecho', 'Hombros', 'Triceps', 'Biceps', 'Antebrazos', 'Lumbares', 'Abdominales', 'Piernas'];
}
