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
  styleUrl: './register-form.component.css'
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

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: this.email,
        password: this.password,
        options: {
          data: {
            fullNameL: this.fullName,
            username: this.username,
            department: this.department,
            profileImageUrl: this.profileImageUrl
          }
        }
      });

      if (error) {
        console.error('Registration error:', error.message);
        // Provide user feedback
        alert(`Registration failed: ${error.message}`);
        return;
      }

      console.log('User registered successfully:', data);
      alert('Registration successful! Please check your email for confirmation.');

    } catch (err) {
      console.error('Unexpected error during registration:', err);
      alert('An unexpected error occurred. Please try again later.');
    }
  }
}
