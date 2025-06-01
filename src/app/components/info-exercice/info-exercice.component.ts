import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { EjerciciosService } from '../../services/ejercicios.service'; // Ajusta ruta según tu estructura
import { Ejercicio } from '../../interfaces/ejercicio.interface';
import { switchMap } from 'rxjs/operators';

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
    private ejerciciosService: EjerciciosService
  ) {}

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

  onSubmit(): void {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para registrar una serie');
      return;
    }

    if (this.ejercicioForm.valid) {
      const modalElement = document.getElementById('serieModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
      this.mensajeVisible = true;
      setTimeout(() => {
        this.mensajeVisible = false;
      }, 5000); // 5 segundos
    } else {
      this.ejercicioForm.markAllAsTouched();
    }
  }

  volver() {
    window.history.back();
  }
}
