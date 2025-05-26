import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exercice-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercice-card.component.html',
  styleUrl: './exercice-card.component.scss'
})
export class ExerciceCardComponent {

  @Input() nombre!: string;
  @Input() series!: number;
  @Input() imagen!: string;

  constructor(private router: Router) {}

  irADetalle() {
    this.router.navigate(['/main/info-exercice', this.nombre]);
  }
}
