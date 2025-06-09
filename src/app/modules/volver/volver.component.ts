import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-volver',
  standalone: true,
  imports: [],
  templateUrl: './volver.component.html',
  styleUrl: './volver.component.scss'
})
export class VolverComponent {
  constructor(private router: Router) { }
  volver() {
    const currentUrl = this.router.url;

    if (currentUrl === '/main/login') {
      this.router.navigate(['/main']);
    } else {
      window.history.back();
    }
  }
}
