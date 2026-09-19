import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Ripple } from '@shared/ui/ripple/ripple';

import { type RegistroEjercicio, type Serie } from '../domain/registro.model';

/**
 * Tarjeta desplegable de un ejercicio registrado. El estado abierto lo controla la página, igual
 * que editar y borrar cada serie.
 */
@Component({
  selector: 'app-registro-card',
  imports: [DatePipe, DecimalPipe, Ripple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registro-card.html',
  styleUrl: './registro-card.scss',
})
export class RegistroCard {
  readonly registro = input.required<RegistroEjercicio>();
  readonly abierto = input.required<boolean>();
  readonly alternar = output();
  readonly editar = output<Serie>();
  readonly borrar = output<Serie>();
}
