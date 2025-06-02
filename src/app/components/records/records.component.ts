import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolverComponent } from '../../modules/volver/volver.component';

export interface Serie {
  dia: string;
  numero: number;
  repeticiones: number;
  peso: number;
  descanso: number;
}

export interface Ejercicio {
  id: number; 
  nombre: string;
  imagen: string;
  series: Serie[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, VolverComponent],
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss'
})
export class RecordsComponent implements OnInit {

  ejercicios: Ejercicio[] = [];

  constructor() { }

  ngOnInit(): void {
    // Los datos de ejemplo con IDs únicos
    this.ejercicios = [
      { id: 1, nombre: "Press inclinado", imagen: "assets/press-inclinado.jpg", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 12, peso: 45, descanso: 60 }, { dia: "2025-04-10", numero: 2, repeticiones: 12, peso: 45, descanso: 60 }], isOpen: false },
      { id: 2, nombre: "Remo en barra", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 12, peso: 50, descanso: 70 }], isOpen: false },
      { id: 3, nombre: "Press de banca", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 10, peso: 60, descanso: 90 }], isOpen: false },
      { id: 4, nombre: "Sentadilla", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 8, peso: 80, descanso: 120 }], isOpen: false },
      { id: 5, nombre: "Peso Muerto", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 5, peso: 100, descanso: 180 }], isOpen: false },
      { id: 6, nombre: "Curl de bíceps", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 12, peso: 20, descanso: 60 }], isOpen: false },
      { id: 7, nombre: "Extensiones de tríceps", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 12, peso: 25, descanso: 60 }], isOpen: false },
      { id: 8, nombre: "Press de hombros", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 10, peso: 30, descanso: 90 }], isOpen: false },
      { id: 9, nombre: "Zancadas", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 10, peso: 40, descanso: 75 }], isOpen: false },
      { id: 10, nombre: "Elevaciones de gemelos", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 15, peso: 50, descanso: 45 }], isOpen: false },
      { id: 11, nombre: "Abdominales", imagen: "https://placehold.co/67x67", series: [{ dia: "2025-04-10", numero: 1, repeticiones: 20, peso: 0, descanso: 30 }], isOpen: false },
    ];
  }

  trackByEjercicioId(index: number, ejercicio: Ejercicio): number {
    return ejercicio.id;
  }

  toggleCard(ejercicio: Ejercicio): void {
    this.ejercicios.forEach(ej => {
      if (ej.id !== ejercicio.id) {
        ej.isOpen = false;
      }
    });
    ejercicio.isOpen = !ejercicio.isOpen;
  }
 
}