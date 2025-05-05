import { Component } from '@angular/core';
import { VolverComponent } from '../../modules/volver/volver.component';

@Component({
  selector: 'app-basic-profile',
  standalone: true,
  imports: [VolverComponent],
  templateUrl: './basic-profile.component.html',
  styleUrl: './basic-profile.component.scss'
})
export class BasicProfileComponent {

}
