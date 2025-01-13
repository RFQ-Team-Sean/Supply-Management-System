import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  account_status: string;
  image?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  @Input() user: User | null = null;
  @Output() profileUpdated = new EventEmitter<User>();

  roles = ['GSO Officer', 'Department Staff', 'BAC Staff', 'Property Officer'];
  statuses = ['Active', 'Inactive'];
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.user) {
      const updatedUser = {
        ...this.user,
        image: this.imagePreview || this.user.image
      };
      this.profileUpdated.emit(updatedUser);
    }
  }
}
