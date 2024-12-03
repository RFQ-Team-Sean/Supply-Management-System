import { Component } from '@angular/core';
import { LoginFormComponent } from './login-form/login-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    LoginFormComponent
  ],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent {
  // Component logic here
}
