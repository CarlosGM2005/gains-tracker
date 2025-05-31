import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-info-exercice',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './info-exercice.component.html',
  styleUrl: './info-exercice.component.scss'
})
export class InfoExerciceComponent implements OnInit {
  nombreEjercicio!: string;
  ejercicioForm!: FormGroup;
  mensajeVisible: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    // ✅ Detecta usuario logueado correctamente incluso tras refresh
    onAuthStateChanged(this.auth, (user: User | null) => {
      this.isLoggedIn = !!user;
    });

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
