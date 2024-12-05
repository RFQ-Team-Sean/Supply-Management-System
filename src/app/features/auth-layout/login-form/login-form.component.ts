import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthError } from '@supabase/supabase-js';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  async signIn() {
    try {
      const { data, error } = await this.supabaseService.signIn(this.email, this.password);
      
      if (error) {
        console.error('Sign-in error:', error);
        alert((error as AuthError).message || 'Failed to sign in');
        return;
      }

      if (data?.user) {
        const role = await this.supabaseService.getUserRole(this.email);
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
          alert('User role not found');
        }
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      alert('An error occurred during sign-in');
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