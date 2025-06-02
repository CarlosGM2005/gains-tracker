import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { EjerciciosService } from '../../services/ejercicios.service'; // Ajusta ruta según tu estructura
import { Ejercicio } from '../../interfaces/ejercicio.interface';
import { switchMap } from 'rxjs/operators';
import { ConsumobbddService } from '../../services/consumobbdd.service';

declare var bootstrap: any;

@Component({
  selector: 'app-info-exercice',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './info-exercice.component.html',
  styleUrl: './info-exercice.component.scss'
})
export class InfoExerciceComponent implements OnInit {
  nombreEjercicio: string = '';
  ejercicio!: Ejercicio | undefined;
  ejercicioForm!: FormGroup;
  mensajeVisible: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: Auth,
    private ejerciciosService: EjerciciosService,
    private consumobbddService: ConsumobbddService
  ) { }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user: User | null) => {
      this.isLoggedIn = !!user;
    });

    this.ejercicioForm = this.fb.group({
      dia: [null, Validators.required],
      series: [null, [Validators.required, Validators.min(1)]],
      repeticiones: [null, [Validators.required, Validators.min(1)]],
      peso: [null, [Validators.required, Validators.min(0)]],
      descanso: [null, [Validators.required, Validators.min(0)]]
    });

    this.nombreEjercicio = this.route.snapshot.paramMap.get('nombre') || '';

    if (this.nombreEjercicio) {
      this.ejerciciosService.getEjercicioPorNombre(this.nombreEjercicio).subscribe(ejercicio => {
        this.ejercicio = ejercicio;
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para registrar una serie');
      return;
    }

    if (this.ejercicioForm.valid && this.ejercicio) {
      const nuevaSerie = {
        dia: this.ejercicioForm.value.dia,
        numero: this.ejercicioForm.value.series,
        repeticiones: this.ejercicioForm.value.repeticiones,
        peso: this.ejercicioForm.value.peso,
        descanso: this.ejercicioForm.value.descanso,
      };

      try {
        await this.consumobbddService.agregarSerieAEjercicio(
          this.ejercicio.id,
          this.ejercicio.nombre,
          this.ejercicio.imgFin,
          nuevaSerie
        );

        const modalElement = document.getElementById('serieModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }

        this.mensajeVisible = true;
        setTimeout(() => {
          this.mensajeVisible = false;
        }, 5000);

        this.ejercicioForm.reset();

      } catch (error) {
        console.error('Error al registrar la serie:', error);
        alert('Hubo un error al registrar la serie, intenta de nuevo.');
      }
    } else {
      this.ejercicioForm.markAllAsTouched();
    }
  }


  volver() {
    window.history.back();
  }
}
