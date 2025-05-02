import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-exercices',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './exercices.component.html',
  styleUrl: './exercices.component.scss'
})
export class ExercicesComponent implements OnInit {
  musculos = ['ESPALDA','PECHO', 'HOMBROS', 'TRICEPS', 'BICEPS', 'ANTEBRAZOS', 'LUMBARES', 'ABDOMINALES', 'PIERNAS'];
  musculoSeleccionado = 'Espalda';
  nivelSeleccionado: string = "";
  // Eliminar la propiedad 'router: any' porque no se está utilizando de esta manera.

  constructor(private route: ActivatedRoute, private router: Router) { }  // Inyección del Router aquí

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
}

