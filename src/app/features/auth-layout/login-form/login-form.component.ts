import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

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
    console.log('Attempting sign-in');
    // Dummy accounts with passwords
    const dummyAccounts = [
        { email: 'user@gmail.com', password: 'userpassword', role: 'user' },
        { email: 'admin@gmail.com', password: 'adminpassword', role: 'admin' },
        { email: 'bac@gmail.com', password: 'bacpassword', role: 'bac' },
        { email: 'gso@gmail.com', password: 'gsopassword', role: 'gso' },
        { email: 'department_staff@gmail.com', password: 'deptpassword', role: 'user' },
        { email: 'property_officer@gmail.com', password: 'propertypassword', role: 'user' },
    ];

    const user = dummyAccounts.find(u => u.email === this.email && u.password === this.password);
    
    if (user) {
        localStorage.setItem('userRole', user.role);
        if (user.role === 'user') {
            this.router.navigate(['/user/dashboard']);
        } else if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
        } else if (user.role === 'gso') {
            this.router.navigate(['/gso/dashboard']);
        } else if (user.role === 'bac') {
            this.router.navigate(['/bac/dashboard']); // Assuming you have a BAC dashboard
        }
    } else {
        alert('Role not found or invalid password');
    }
  }

  onSubmit() {
    this.signIn();
  }

  autoSignInUser() {
    this.email = 'user@gmail.com';
    this.password = 'userpassword'; // Set dummy password
    this.signIn();
  }

  autoSignInAdmin() {
    this.email = 'admin@gmail.com';
    this.password = 'adminpassword'; // Set dummy password
    this.signIn();
  }

  autoSignInBac() {
    this.email = 'bac@gmail.com';
    this.password = 'bacpassword'; // Set dummy password
    this.signIn();
  }

  autoSignInGso() {
    this.email = 'gso@gmail.com';
    this.password = 'gsopassword'; // Set dummy password
    this.signIn();
  }
}