import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserFilterComponent } from './user-filter/user-filter.component';
import { RolesandpermissionComponent } from './rolesandpermission/rolesandpermission.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EditRolespermissionComponent } from './rolesandpermission/edit-rolespermission/edit-rolespermission.component';
import { AddRolesandpermissionComponent } from './rolesandpermission/add-rolesandpermission/add-rolesandpermission.component';
import { UActivitylogsComponent } from './u-activitylogs/u-activitylogs.component';

interface User {
  account_id: number;
  name: string;
  email: string;
  role: string;
  account_status: string;
  showActions?: boolean;
}

interface RolesAndPermission {
  id: number;
  roles: string;
  number_of_users: number;
  permission: string;
  last_modified: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    CreateUserComponent, 
    UserFilterComponent,
    RolesandpermissionComponent,
    UserProfileComponent,
    EditRolespermissionComponent,
    AddRolesandpermissionComponent,
    UActivitylogsComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(RolesandpermissionComponent) rolesComponent!: RolesandpermissionComponent;

  roles = ['GSO Officer', 'Department Staff', 'BAC Staff', 'Property Officer'];
  statuses = ['Active', 'Inactive'];
  selectedRoles: string[] = []; // Array for multiple role selection
  selectedRoleFilter: string = '';
  selectedStatus: string | null = null;
  users: User[] = [];
  displayedUsers: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  isCreatingUser: boolean = false;
  isCreateButtonSelected = false;
  username: string = '';
  email: string = '';
  currentView: 'users' | 'roles' | 'logs' = 'users';
  showUserProfile: boolean = false;
  selectedUser: User | null = null;
  selectedRole: RolesAndPermission | null = null;
  showRoleEdit: boolean = false;
  rolesandpermissions: RolesAndPermission[] = [];
  isCreatingRole: boolean = false;

  // Add this property to store filtered users
  filteredUsers: User[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.filteredUsers = [...this.users];
    this.updateDisplayedUsers();
  }

  initializeDummyData(): void {
    this.users = [
      { account_id: 1, name: 'John Doe', email: 'johndoe@example.com', role: 'GSO Officer', account_status: 'Active' },
      { account_id: 2, name: 'Jane Smith', email: 'janesmith@example.com', role: 'Department Staff', account_status: 'Inactive' },
      { account_id: 3, name: 'Alice Johnson', email: 'alicejohnson@example.com', role: 'BAC Staff', account_status: 'Active' },
      { account_id: 4, name: 'Bob Brown', email: 'bobbrown@example.com', role: 'Property Officer', account_status: 'Inactive' },
      { account_id: 5, name: 'Carlos White', email: 'carloswhite@example.com', role: 'GSO Officer', account_status: 'Active' },
      { account_id: 6, name: 'Diana Prince', email: 'dianaprince@example.com', role: 'Department Staff', account_status: 'Active' },
      { account_id: 7, name: 'Clark Kent', email: 'clarkkent@example.com', role: 'Property Officer', account_status: 'Inactive' },
      { account_id: 8, name: 'Bruce Wayne', email: 'brucewayne@example.com', role: 'BAC Staff', account_status: 'Active' },
      { account_id: 9, name: 'Peter Parker', email: 'peterparker@example.com', role: 'GSO Officer', account_status: 'Inactive' },
      { account_id: 10, name: 'Natasha Romanoff', email: 'natasharomanoff@example.com', role: 'Department Staff', account_status: 'Active' }
    ];
  }

  toggleRoleSelection(role: string): void {
    if (this.selectedRoles.includes(role)) {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    } else {
      this.selectedRoles.push(role);
    }
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  applyFilters(filters: any): void {
    if (this.currentView === 'users') {
      this.filteredUsers = this.users.filter(user => {
        const matchesRole = !filters.roles.length || filters.roles.includes(user.role);
        const matchesStatus = !filters.status || user.account_status === filters.status;
        return matchesRole && matchesStatus;
      });
      this.currentPage = 1;
      this.updateDisplayedUsers();
    } else if (this.currentView === 'roles' && this.rolesComponent) {
      this.rolesComponent.applyFilters(filters);
    }
  }

  resetFilters(): void {
    this.selectedRoles = [];
    this.selectedStatus = null;
    this.applyFilters({ roles: [], status: null });
  }

  updateDisplayedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedUsers = this.filteredUsers.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedUsers();
  }

  toggleActions(user: User): void {
    this.currentOpenActionId = this.currentOpenActionId === user.account_id ? null : user.account_id;
  }

  deleteUser(user: User): void {
    this.users = this.users.filter(u => u.account_id !== user.account_id);
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayedUsers();
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    this.showUserProfile = true;
    this.currentOpenActionId = null;
  }

  backToFilters(): void {
    this.showUserProfile = false;
    this.showRoleEdit = false;
    this.selectedUser = null;
    this.selectedRole = null;
  }

  createUser(): void {
    this.isCreatingUser = true;
    this.isCreatingRole = false;
    this.showUserProfile = false;
    this.showRoleEdit = false;
  }

  toggleUserCreation(): void {
    this.isCreatingUser = !this.isCreatingUser;
    this.isCreatingRole = false;
    this.showUserProfile = false;
    this.showRoleEdit = false;
  }

  addUser(userData: { name: string; email: string; role: string; status: string }): void {
    const user: User = {
      account_id: this.users.length + 1,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      account_status: userData.status
    };

    this.users.push(user);
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    this.updateDisplayedUsers();
  }

  onSubmit() {
    console.log('Form submitted');
    // Handle your form submission logic here
  }

  switchView(view: 'users' | 'roles' | 'logs') {
    this.currentView = view;
    this.isCreatingUser = false;
    this.isCreatingRole = false;
    this.showUserProfile = false;
    this.showRoleEdit = false;
    this.selectedUser = null;
    this.selectedRole = null;
  }

  updateUserProfile(updatedUser: User): void {
    const index = this.users.findIndex(u => u.account_id === updatedUser.account_id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      this.filteredUsers = this.filteredUsers.map(u => 
        u.account_id === updatedUser.account_id ? updatedUser : u
      );
      this.updateDisplayedUsers();
      this.showUserProfile = false;
      this.selectedUser = null;
    }
  }

  onRoleEdit(role: RolesAndPermission): void {
    this.selectedRole = { ...role };
    this.showRoleEdit = true;
    this.currentOpenActionId = null;
  }

  updateRole(updatedRole: RolesAndPermission): void {
    const roleIndex = this.rolesandpermissions.findIndex(r => r.id === updatedRole.id);
    if (roleIndex !== -1) {
      this.rolesandpermissions[roleIndex] = updatedRole;
    }
    this.showRoleEdit = false;
    this.selectedRole = null;
  }

  closeRoleEdit(): void {
    this.showRoleEdit = false;
    this.selectedRole = null;
  }

  addNewRole(roleForm: { roles: string; permission: string }): void {
    const newRole: RolesAndPermission = {
      id: this.rolesandpermissions.length + 1,
      roles: roleForm.roles,
      permission: roleForm.permission,
      number_of_users: 0,
      last_modified: new Date().toISOString().split('T')[0]
    };

    this.rolesandpermissions.push(newRole);
    this.isCreatingRole = false;
  }

  toggleRoleCreation(): void {
    this.isCreatingRole = !this.isCreatingRole;
    this.isCreatingUser = false;
    this.showUserProfile = false;
    this.showRoleEdit = false;
  }

  backToTable(): void {
    this.showUserProfile = false;
    this.showRoleEdit = false;
    this.selectedUser = null;
    this.selectedRole = null;
    this.currentOpenActionId = null;
  }

  searchRoles(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    
    if (this.currentView === 'users') {
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
      );
      this.currentPage = 1;
      this.updateDisplayedUsers();
    }
  }
}
