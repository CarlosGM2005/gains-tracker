import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolverComponent } from '../../modules/volver/volver.component';
import { AuthService } from '../../services/auth.service';
import { UserData } from '../../interfaces/user.interface';
import { FormsModule } from '@angular/forms';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-data-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, VolverComponent],
  templateUrl: './data-profile.component.html',
  styleUrl: './data-profile.component.scss'
})
export class DataProfileComponent implements OnInit {

  userData$!: Observable<UserData | null>;
  datosActualizados: Partial<UserData> = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userData$ = this.authService.getUserData();
  }

  guardarCambios(): void {
    this.userData$.pipe(take(1)).subscribe(userData => {
      if (!userData) return;

      const datosFiltrados: Partial<UserData> = {};

      for (const key in this.datosActualizados) {
        const valor = this.datosActualizados[key as keyof UserData];
        if (valor !== null && valor !== undefined && valor !== '') {
          datosFiltrados[key as keyof UserData] = valor as any;
        }
      }

      this.authService.actualizarUsuario(datosFiltrados)
        .then(() => {
          alert('Cambios guardados con éxito');

          // Limpiar campos
          this.datosActualizados = {};

          // Recargar el observable
          this.userData$ = this.authService.getUserData();
        })
        .catch(error => {
          console.error('Error al actualizar datos', error);
          alert('Hubo un problema al guardar los cambios');
        });
    });
  }

  getInitial(name?: string): string {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  }
}
