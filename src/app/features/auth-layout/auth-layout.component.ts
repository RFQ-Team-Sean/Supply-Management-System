import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { LoginFormComponent } from './login-form/login-form.component';  // Import LoginFormComponent

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, LoginFormComponent],  // Include CommonModule and LoginFormComponent here
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent {}
