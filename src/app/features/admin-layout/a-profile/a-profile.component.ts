import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-a-profile',
  templateUrl: './a-profile.component.html',
  styleUrls: ['./a-profile.component.css'],
  standalone: true,
  imports: [HeaderComponent]
})
export class AProfileComponent {
 
}