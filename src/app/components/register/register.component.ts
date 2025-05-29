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
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^[A-Za-z0-9]+$/)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\d{9}$/)
      ]],
      edad: ['', [
        Validators.required,
        Validators.min(12),
        Validators.max(99)
      ]],
      peso: ['', [
        Validators.required,
        Validators.min(30),
        Validators.max(300)
      ]],
      altura: ['', [
        Validators.required,
        Validators.min(1.00), 
        Validators.max(2.50) 
      ]]
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
