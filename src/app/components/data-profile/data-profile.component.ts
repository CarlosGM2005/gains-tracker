import { Component } from '@angular/core';
import { VolverComponent } from '../../modules/volver/volver.component';

@Component({
  selector: 'app-data-profile',
  standalone: true,
  imports: [VolverComponent],
  templateUrl: './data-profile.component.html',
  styleUrl: './data-profile.component.scss'
})
export class DataProfileComponent {

}
