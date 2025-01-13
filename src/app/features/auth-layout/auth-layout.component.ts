import { Component } from '@angular/core';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    LoginFormComponent,
    RegisterFormComponent
  ],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent {
  isLogin = true;
  isAnimating = false;
  showForm = true;

  toggleForm() {
    this.isAnimating = true;
    this.showForm = false;
    
    // Wait for exit animation
    setTimeout(() => {
      this.isLogin = !this.isLogin;
      
      // Show form after color transition
      setTimeout(() => {
        this.showForm = true;
        this.isAnimating = false;
      }, 800); // Match the color transition duration
    }, 500);
  }
}
