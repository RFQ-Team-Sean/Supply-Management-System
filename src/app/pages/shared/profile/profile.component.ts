import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Import the PrimeNG Dialog module
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DialogModule // Add PrimeNG Dialog here
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Track active tab
  selectedTab: 'overview' | 'activity' | 'settings' = 'overview';

  // Whether the edit dialog is currently visible
  displayEditModal = false;

  // Example user data
  user = {
    name: 'Jane Smith',
    role: 'Administrator - Asset Management System',
    joinedDate: 'January 2023',
    avatarUrl: './assets/images/logos/qby.png', // local image
    stats: {
      projectsManaged: 24,
      tasksCompleted: 156,
      hoursLogged: 1240
    },
    recentActivity: [
      {
        title: 'Reviewed Budget Allocation',
        description: 'Approved a $150,000 budget for logistics.',
        date: 'March 5, 2025'
      },
      {
        title: 'Updated Procurement Process',
        description: 'Streamlining for better efficiency. Edited guidelines for IT.',
        date: 'March 3, 2025'
      }
    ]
  };

  // Reactive form for editing the user
  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: [this.user.name],
      role: [this.user.role]
    });
  }

  // Switch tabs
  setTab(tab: 'overview' | 'activity' | 'settings'): void {
    this.selectedTab = tab;
  }

  // Open the edit modal
  editProfile(): void {
    // Patch the form with current user values
    this.editForm.patchValue({
      name: this.user.name,
      role: this.user.role
    });
    // Show dialog
    this.displayEditModal = true;
  }

  // Save changes from the modal form
  saveProfile(): void {
    const formValues = this.editForm.value;
    this.user.name = formValues.name;
    this.user.role = formValues.role;
    this.displayEditModal = false;
  }

  // Cancel changes in the dialog
  cancelEdit(): void {
    // Revert form to original user values
    this.editForm.patchValue({
      name: this.user.name,
      role: this.user.role
    });
    this.displayEditModal = false;
  }

  // Example placeholders for your other buttons
  viewReports(): void {
    // Additional logic before navigating to /reports if needed
  }

  manageUsers(): void {
    // Additional logic before navigating to /users if needed
  }
}
