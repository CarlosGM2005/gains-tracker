import { Component } from '@angular/core';

@Component({
  selector: 'app-volver',
  standalone: true,
  imports: [],
  templateUrl: './volver.component.html',
  styleUrl: './volver.component.scss'
})
export class VolverComponent {
  volver() {
    window.history.back(); // Navega a la página anterior
  }
}
