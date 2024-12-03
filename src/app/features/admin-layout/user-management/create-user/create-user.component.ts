import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  @Output() userCreated = new EventEmitter<{name: string; email: string; role: string; status: string}>();
  @Output() cancelCreate = new EventEmitter<void>();

  // Form fields
  username: string = '';
  email: string = '';
  selectedRole: string = '';
  selectedStatus: string = 'Active';
  imagePreview: string | null = null;

  // Dropdown options
  roles = ['GSO Officer', 'Department Staff', 'BAC Staff', 'Property Officer'];
  statuses = ['Active', 'Inactive'];

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.username && this.email && this.selectedRole) {
      this.userCreated.emit({
        name: this.username,
        email: this.email,
        role: this.selectedRole,
        status: this.selectedStatus
      });
      this.resetForm();
    }
  }

  onCancel(): void {
    this.cancelCreate.emit();
  }

  private resetForm(): void {
    this.username = '';
    this.email = '';
    this.selectedRole = '';
    this.selectedStatus = 'Active';
    this.imagePreview = null;
  }
}
