// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { SupabaseService, User } from '../../../core/services/supabase.service';

// @Component({
//   selector: 'app-login-form',
//   standalone: true,
//   imports: [FormsModule],
//   templateUrl: './login-form.component.html',
//   styleUrls: ['./login-form.component.css'],
// })
// export class LoginFormComponent {
//   email: string = '';
//   password: string = '';

//   constructor(private router: Router, private supabaseService: SupabaseService) {}

//   async signIn() {
//     console.log('Attempting sign-in');
//     try {
//       const { data, error } = await this.supabaseService.signIn(this.email, this.password);
//       if (error) {
//         alert('Invalid credentials');
//         console.error('Sign-in error:', error);
//         return;
//       }

//       // Fetch all users and filter by the email provided during sign-in
//       const users: User[] = await this.supabaseService.getUsers();
//       const user = users.find(u => u.email === this.email);
      
//       if (user) {
//         localStorage.setItem('userRole', user.role);
//         if (user.role === 'user') {
//           this.router.navigate(['/user/dashboard']);
//         } else if (user.role === 'admin') {
//           this.router.navigate(['/admin/dashboard']);
//         }
//       } else {
//         alert('Role not found');
//       }
//     } catch (error) {
//       console.error('Error during sign-in:', error);
//     }
//   }

//   onSubmit() {
//     this.signIn();
//   }

//   autoSignInUser() {
//     this.email = 'user@gmail.com';
//     this.password = 'password';
//     this.signIn();
//   }

//   autoSignInAdmin() {
//     this.email = 'admin@gmail.com';
//     this.password = 'password';
//     this.signIn();
//   }
// }
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { data, error } = await this.supabaseService.signIn(
          this.loginForm.value.email,
          this.loginForm.value.password
        );

        if (error) {
          this.errorMessage = 'Invalid credentials. Please try again.';
          console.error('Sign-in error:', error);
          this.isLoading = false;
          return;
        }

        if (data?.user) {
          // Navigate based on user role
          switch (data.user.role) {
            case 'Admin':
              await this.router.navigate(['/admin/dashboard']);
              break;
            case 'Department':
              await this.router.navigate(['/department/dashboard']);
              break;
            case 'BAC':
              await this.router.navigate(['/bac/dashboard']);
              break;
            case 'Property_Management':
              await this.router.navigate(['/property/dashboard']);
              break;
            case 'GSO':
              await this.router.navigate(['/gso/dashboard']);
              break;
            default:
              this.errorMessage = 'Invalid user role';
              this.isLoading = false;
          }
        } else {
          this.errorMessage = 'User data not found';
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Error during sign-in:', error);
        this.errorMessage = 'An unexpected error occurred. Please try again.';
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}