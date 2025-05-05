import { Component } from '@angular/core';
import { VolverComponent } from '../../modules/volver/volver.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [VolverComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}
