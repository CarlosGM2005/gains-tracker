import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolverComponent } from '../../modules/volver/volver.component';
import { ejercicioSerie } from '../../interfaces/ejercicioSerie.interface';
import { ConsumobbddService } from '../../services/consumobbdd.service'; // Asegúrate de que esta ruta es correcta
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, VolverComponent],
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss'
})
export class RecordsComponent implements OnInit {

  ejercicios: ejercicioSerie[] = [];

  constructor(private consumobbddService: ConsumobbddService) {}

  ngOnInit(): void {
    this.consumobbddService.getEjerciciosRegistradosDelUsuario()
      .pipe(take(1))
      .subscribe(ejercicios => {
        this.ejercicios = ejercicios;
      });
  }

  trackByEjercicioId(index: number, ejercicio: ejercicioSerie): string {
    return ejercicio.id;
  }

  toggleCard(ejercicio: ejercicioSerie): void {
    this.ejercicios.forEach(ej => {
      if (ej.id !== ejercicio.id) {
        ej.isOpen = false;
      }
    });
    ejercicio.isOpen = !ejercicio.isOpen;
  }
}
