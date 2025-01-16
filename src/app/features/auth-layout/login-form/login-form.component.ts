import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthError } from '@supabase/supabase-js';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    // Auto hide after 5 seconds
    setTimeout(() => {
      this.showError = false;
      this.errorMessage = '';
    }, 5000);
  }

  async signIn() {
    this.isLoading = true;
    this.showError = false; // Reset error state
    
    try {
      const { data, error } = await this.supabaseService.signIn(this.email, this.password);
      
      if (error) {
        console.error('Sign-in error:', error);
        this.showErrorMessage((error as AuthError).message || 'Invalid email or password');
        return;
      }

      if (data?.user) {
        const role = await this.supabaseService.getUserRole(this.email);
        console.log(this.email)
        console.log('Retrieved role:', role);
        
        if (role) {
          const normalizedRole = role.toLowerCase();
          console.log('Normalized role:', normalizedRole);
          localStorage.setItem('userRole', normalizedRole);
          
          if (normalizedRole === 'department') {
            await this.router.navigate(['/user/dashboard']);
          } else {
            await this.router.navigate([`/${normalizedRole}/dashboard`]);
          }
        } else {
          console.error('No role returned from getUserRole');
          this.showErrorMessage('User role not found');
        }
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      this.showErrorMessage('An unexpected error occurred');
    } finally {
      this.isLoading = false;
    }
  }

  onSubmit() {
    this.signIn();
  }

  // Auto sign-in methods using Supabase authentication
  autoSignInUser() {
    this.email = 'it.department@gmail.com';
    this.password = 'RFQpassword@1234';
    this.signIn();
  }

  autoSignInAdmin() {
    this.email = 'admin@gmail.com';
    this.password = 'RFQpassword@1234';
    this.signIn();
  }

  autoSignInBac() {
    this.email = 'bac@gmail.com';
    this.password = 'RFQpassword@1234';
    this.signIn();
  }

  autoSignInGso() {
    this.email = 'gso@gmail.com';
    this.password = 'RFQpassword@1234';
    this.signIn();
  }
}