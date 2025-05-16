import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VolverComponent } from "../../modules/volver/volver.component";

@Component({
  selector: 'app-exercices',
  standalone: true,
  imports: [RouterLink, VolverComponent],
  templateUrl: './exercices.component.html',
  styleUrl: './exercices.component.scss'
})
export class ExercicesComponent implements OnInit {
  musculos = ['ESPALDA','PECHO', 'HOMBROS', 'TRICEPS', 'BICEPS', 'ANTEBRAZOS', 'LUMBARES', 'ABDOMINALES', 'PIERNAS'];
  musculoSeleccionado = 'Espalda';
  nivelSeleccionado: string = "";
  

  constructor(private route: ActivatedRoute, private router: Router) { }  

  ngOnInit(): void {
    this.nivelSeleccionado = this.route.snapshot.paramMap.get('level')!;
    
    if (!['Avanzado', 'Intermedio', 'Principiante'].includes(this.nivelSeleccionado)) {
      // Si no es un nivel válido, redirige al usuario a '/main'
      this.router.navigate(['/main']);
    }
  }

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

