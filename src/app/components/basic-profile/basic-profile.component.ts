import { Component } from '@angular/core';
import { VolverComponent } from '../../modules/volver/volver.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-basic-profile',
  standalone: true,
  imports: [VolverComponent, RouterLink],
  templateUrl: './basic-profile.component.html',
  styleUrl: './basic-profile.component.scss'
})
export class BasicProfileComponent {
  
  
constructor(private authService: AuthService, private router: Router) {}

async cerrarSesion() {
  await this.authService.logout();
}
} 
