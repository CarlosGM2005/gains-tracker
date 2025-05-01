import { Component } from '@angular/core';
import { BarraNavegacionComponent } from '../barra-navegacion/barra-navegacion.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [BarraNavegacionComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
