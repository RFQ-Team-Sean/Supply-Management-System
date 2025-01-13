import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  @ViewChild('fileInput') fileInput!: ElementRef;

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  department: string = '';
  password: string = '';
  confirmPassword: string = '';
  profileImageUrl: string | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
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

  onSubmit() {
    // Add your registration logic here
    console.log('Form submitted', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      username: this.username,
      department: this.department,
      password: this.password,
      confirmPassword: this.confirmPassword,
      profileImage: this.profileImageUrl
    });
  }
}
