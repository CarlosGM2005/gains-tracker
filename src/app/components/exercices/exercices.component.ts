import { Component,  OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-exercices',
  standalone: true,
  imports: [],
  templateUrl: './exercices.component.html',
  styleUrl: './exercices.component.scss'
})
export class ExercicesComponent implements OnInit {
  musculos = ['ESPALDA','PECHO', 'HOMBROS', 'TRICEPS', 'BICEPS', 'ANTEBRAZOS', 'LUMBARES', 'ABDOMINALES', 'PIERNAS'];
  musculoSeleccionado = 'Espalda';
  nivelSeleccionado: string = "";

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.nivelSeleccionado = this.route.snapshot.paramMap.get('level')!;
  }

  seleccionarMusculo(musculo:string){
    this.musculoSeleccionado = musculo;
  }
}
