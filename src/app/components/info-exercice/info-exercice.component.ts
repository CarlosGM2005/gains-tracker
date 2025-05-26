import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';


declare var bootstrap: any;


@Component({
  selector: 'app-info-exercice',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './info-exercice.component.html',
  styleUrl: './info-exercice.component.scss'
})
export class InfoExerciceComponent {
  nombreEjercicio!: string;
  ejercicioForm!: FormGroup;
  mensajeVisible: boolean = false;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.nombreEjercicio = this.route.snapshot.paramMap.get('nombre') || '';

    this.ejercicioForm = this.fb.group({
      dia: [null, Validators.required],
      series: [null, [Validators.required, Validators.min(1)]],
      repeticiones: [null, [Validators.required, Validators.min(1)]],
      peso: [null, [Validators.required, Validators.min(0)]],
      descanso: [null, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.ejercicioForm.valid) {
      const modalElement = document.getElementById('serieModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
       this.mensajeVisible = true;
      setTimeout(() => {
        this.mensajeVisible = false; // Oculta el mensaje después de 5 segundos
      }, 5000);
    } else {
      this.ejercicioForm.markAllAsTouched();
    }
  }


  volver() {
    window.history.back(); // Navega a la página anterior
  }
}
