import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraNavegacionComponent } from '../../components/barra-navegacion/barra-navegacion.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, BarraNavegacionComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'] // si tienes estilos
})
export class MainLayoutComponent {}
