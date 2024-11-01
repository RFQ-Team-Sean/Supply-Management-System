// login-form.component.ts
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SupabaseService, User } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password } = this.loginForm.value;
        await this.performSignIn(email, password);
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'An unexpected error occurred';
      } finally {
        this.isLoading = false;
      }
    }
  }

  async autoSignIn(email: string, password: string): Promise<void> {
    if (!this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        await this.performSignIn(email, password);
      } catch (error) {
        console.error('Auto sign-in error:', error);
        this.errorMessage = 'Auto sign-in failed';
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async performSignIn(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabaseService.signIn(email, password);

    if (error) {
      this.errorMessage = typeof error === 'string' ? error : 'Invalid email or password';
      return;
    }

    if (!data?.user) {
      this.errorMessage = 'Login failed';
      return;
    }

    this.supabaseService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user: User | null) => {
      if (user) {
        this.handleNavigation(user.role);
      } else {
        this.errorMessage = 'User role not found';
      }
    });
  }

  private handleNavigation(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      'admin': '/admin/dashboard',
      'gso': '/gso/dashboard',
      'department': '/department/dashboard',
      'property_management': '/property/dashboard',
      'bac': '/bac/dashboard'
    };

    const normalizedRole = role.toLowerCase().replace(' ', '_');
    const route = roleRoutes[normalizedRole];
    
    if (route) {
      this.router.navigate([route]);
    } else {
      this.errorMessage = 'Invalid user role';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}