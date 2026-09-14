import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { type RegistroEjercicio } from '../domain/registro.model';

/** Tarjeta desplegable de un ejercicio registrado. El estado abierto lo controla la página. */
@Component({
  selector: 'app-registro-card',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registro-card.html',
  styleUrl: './registro-card.scss',
})
export class RegistroCard {
  readonly registro = input.required<RegistroEjercicio>();
  readonly abierto = input.required<boolean>();
  readonly alternar = output();
}
