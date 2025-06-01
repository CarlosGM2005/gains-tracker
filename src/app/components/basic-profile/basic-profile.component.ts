import { Component } from '@angular/core';
import { VolverComponent } from '../../modules/volver/volver.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { UserData } from '../../interfaces/user.interface';

@Component({
  selector: 'app-basic-profile',
  standalone: true,
  imports: [CommonModule, VolverComponent, RouterLink],
  templateUrl: './basic-profile.component.html',
  styleUrl: './basic-profile.component.scss'
})
export class BasicProfileComponent {
  userData$: Observable<UserData | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.userData$ = this.authService.getUserData();
  }

  async cerrarSesion() {
    await this.authService.logout();
  }

  getInitial(name?: string): string {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  }

}
