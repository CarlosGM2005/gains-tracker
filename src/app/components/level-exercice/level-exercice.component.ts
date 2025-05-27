import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-level-exercice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-exercice.component.html',
  styleUrl: './level-exercice.component.scss'
})
export class LevelExerciceComponent {
  constructor(private router: Router) {}

  niveles = ['Principiante', 'Intermedio', 'Avanzado'];
  seleccionado = 'Avanzado'; // por defecto


  seleccionarNivel(nivel: string) {
    this.seleccionado = nivel;
  }

  continuar() {
    
    console.log('Nivel seleccionado:', this.seleccionado);
    this.router.navigate(['main/exercices', this.seleccionado]); 

  }
}
