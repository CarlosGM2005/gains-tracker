import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VolverComponent } from "../../modules/volver/volver.component";

@Component({
  selector: 'app-recomendations',
  standalone: true,
  imports: [RouterLink, VolverComponent],
  templateUrl: './recomendations.component.html',
  styleUrl: './recomendations.component.scss'
})
export class RecomendationsComponent {
  musculos = ['ESPALDA','PECHO', 'HOMBROS', 'TRICEPS', 'BICEPS', 'ANTEBRAZOS', 'LUMBARES', 'ABDOMINALES', 'PIERNAS'];
  musculoSeleccionado = 'Espalda';
  

  constructor(private route: ActivatedRoute, private router: Router) { }  

  seleccionarMusculo(musculo: string): void {
    this.musculoSeleccionado = musculo;
  }

  volver() {
    window.history.back(); // Navega a la página anterior
  }

  irPerfiloLogin(){
    //Logica con firebase si se ha autenticado
  }
}
