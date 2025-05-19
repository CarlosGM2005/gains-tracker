import { Component } from '@angular/core';
import { VolverComponent } from '../../modules/volver/volver.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-basic-profile',
  standalone: true,
  imports: [VolverComponent, RouterLink],
  templateUrl: './basic-profile.component.html',
  styleUrl: './basic-profile.component.scss'
})
export class BasicProfileComponent {

}
