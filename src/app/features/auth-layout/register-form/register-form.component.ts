import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent {
  private supabase: SupabaseClient;
  @ViewChild('fileInput') fileInput!: ElementRef;

  fullName: string = '';
  email: string = '';
  username: string = '';
  department: string = '';
  password: string = '';
  confirmPassword: string = '';
  profileImageUrl: string | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  validDepartments: string[] = [
    'academic_department',
    'administrative_department',
    'IT_deparment',
    'financial_department',
    'operation_department',
    'humanresource_department',
  ];

  constructor() {
    this.supabase = createClient('https://rewloptzuoxkrhpxrwnf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld2xvcHR6dW94a3JocHhyd25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxOTkyMDMsImV4cCI6MjA0ODc3NTIwM30.NuQab__PhiQ3bsd1nzoFkwHR814bTAUOofRsFRcBC34');
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  }

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!this.validatePassword(this.password)) {
      alert('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }

    // Validate the department value against the valid department types
    if (!this.validDepartments.includes(this.department)) {
      alert('Please select a valid department.');
      return;
    }

    try {
      // Step 1: Register the user with email and password
      const { data: user, error: userError } = await this.supabase.auth.signUp({
        email: this.email,
        password: this.password,
        options: {
          data: {
            fullName: this.fullName,
            username: this.username,
            department: this.department,
            profileImageUrl: this.profileImageUrl,
          },
        },
      });

      if (userError) {
        console.error('Registration error:', userError.message);
        alert(`Registration failed: ${userError.message}`);
        return;
      }

      // Step 2: Insert user details into the public.account table
      const { data: account, error: accountError } = await this.supabase
        .from('account')
        .insert([{
          id: user.user?.id ?? '',  // Use the Supabase Auth user ID
          name: this.fullName,
          username: this.username,
          department: this.department,
          role: 'department', // Set a default role (can be adjusted based on your business logic)
          profile_image: this.profileImageUrl,
          account_status: 'active', // Default value
          created_at: new Date(),
          updated_at: new Date(),
        }]);

      if (accountError) {
        console.error('Error inserting into account:', accountError.message);
        alert(`Error: ${accountError.message}`);
        return;
      }

      console.log('User registered and account inserted successfully:', account);
      alert('Registration successful! Please check your email for confirmation.');
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      alert('An unexpected error occurred. Please try again later.');
    }
  }
}
