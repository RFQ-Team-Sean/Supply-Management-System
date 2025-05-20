import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { UserService, User } from 'src/app/services/user.service';

interface UserWithAssignedRole extends User {
  assignedRole: string; // Extend the User model with this field dynamically
}

@Component({
  selector: 'app-account-setup',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    ToastModule,
    TabViewModule,
    FormsModule,
    ReactiveFormsModule,
    BadgeModule
  ],
  templateUrl: './account-setup.component.html',
  styleUrls: ['./account-setup.component.scss'],
  providers: [MessageService]
})
export class AccountSetupComponent implements OnInit {
  users: UserWithAssignedRole[] = []; // Now includes assignedRole dynamically
  accountDialog = false;
  accountForm!: FormGroup;
  isEditMode = false;
  selectedUser: UserWithAssignedRole | null = null;

  // Account Roles
  userRoles = ['Payables', 'Inventory', 'Purchase Return', 'Purchases'];

  constructor(private userService: UserService, private fb: FormBuilder, private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.initAccountForm();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users.map(user => ({
        ...user,
        assignedRole: this.getRandomRole() // Assign a random role dynamically
      }));
    });
  }

  getRandomRole(): string {
    return this.userRoles[Math.floor(Math.random() * this.userRoles.length)];
  }

  initAccountForm() {
    this.accountForm = this.fb.group({
      fullname: ['', Validators.required],
      role: ['', Validators.required], // User Type (superadmin, admin, etc.)
      assignedRole: ['', Validators.required] // The new "Role"
    });
  }

  openAccountDialog(user: UserWithAssignedRole | null = null) {
    this.isEditMode = !!user;
    this.accountDialog = true;
    this.selectedUser = user;

    if (user) {
      this.accountForm.patchValue({
        fullname: user.fullname,
        role: user.role, // This is the user type (e.g., admin, accounting)
        assignedRole: user.assignedRole // Assigned role (e.g., Payables, Inventory)
      });
    } else {
      this.accountForm.reset();
    }
  }

  saveAccount() {
    if (this.accountForm.valid) {
      const accountData = this.accountForm.value;

      if (this.isEditMode && this.selectedUser) {
        const index = this.users.findIndex(a => a.id === this.selectedUser?.id);
        this.users[index] = { ...this.selectedUser, ...accountData };
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account updated successfully' });
      } else {
        const newAccount = { id: (this.users.length + 1).toString(), ...accountData };
        this.users.push(newAccount);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account added successfully' });
      }

      this.accountDialog = false;
    }
  }

  deleteAccount(user: UserWithAssignedRole) {
    this.users = this.users.filter(a => a.id !== user.id);
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Account removed' });
  }
}
