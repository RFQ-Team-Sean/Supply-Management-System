//signup.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Import Router
import { SupabaseService } from '../../app/services/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  roles: any[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router  // Inject Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  async ngOnInit() {
    try {
      this.roles = await this.supabaseService.getRoles();
    } catch (error) {
      this.errorMessage = 'Failed to load roles.';
      console.error(error);
    }
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    const { name, email, role } = this.signupForm.value;

    try {
      await this.supabaseService.signUpUser(name, email, role);
      this.successMessage = 'User signed up successfully!';
      this.signupForm.reset();

      // Redirect to login page after successful sign-up
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorMessage = 'Failed to sign up user.';
      console.error(error);
    }
  }
}
