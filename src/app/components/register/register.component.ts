import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VolverComponent } from '../../modules/volver/volver.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, VolverComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      telefono: ['', Validators.required],
      edad: ['', Validators.required],
      peso: ['', Validators.required],
      altura: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    const { password, ...userData } = this.registerForm.value;

    try {
      await this.authService.register(userData, password);
      // Redirige desde el servicio
    } catch (error) {
      console.error('Error de registro:', error);
      alert('No se pudo registrar el usuario. Revisa los datos.');
    }
  }
}
