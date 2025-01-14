import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserFilterComponent } from './user-filter/user-filter.component';
import { RolesandpermissionComponent } from './rolesandpermission/rolesandpermission.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UActivitylogsComponent } from './u-activitylogs/u-activitylogs.component';
import { EditRolesandpermissionComponent } from './rolesandpermission/edit-rolesandpermission/edit-rolesandpermission.component';
import { SupabaseService } from '../../../core/services/supabase.service';

interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  account_status: string;
  role: string;
  profile_image?: string;
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
    FormsModule,
    UserFilterComponent,
    RolesandpermissionComponent,
    UserProfileComponent,
    UActivitylogsComponent,
    EditRolesandpermissionComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(RolesandpermissionComponent) rolesComponent!: RolesandpermissionComponent;

  roles = ['GSO Officer', 'Department Staff', 'BAC Staff', 'Property Officer'];
  statuses = ['Active', 'Inactive'];
  selectedRoles: string[] = [];
  selectedRoleFilter: string = '';
  selectedStatus: string | null = null;
  users: User[] = [];
  displayedUsers: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  currentOpenActionId: string | null = null;
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
  imagePreview: string | ArrayBuffer | null = null;
  selectedImage: File | null = null;

  // Add this property to store filtered users
  filteredUsers: User[] = [];

  constructor(private router: Router, private SupabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.getUserData();
  }

  async getUserData(){
    this.users = await this.SupabaseService.getUsers();
    this.filteredUsers = [...this.users];
    this.updateDisplayedUsers();
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
    this.currentOpenActionId = this.currentOpenActionId === user.id ? null : user.id;
  }

  deleteUser(user: User): void {
    this.users = this.users.filter(u => u.id !== user.id);
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

  // Commented since admin will not add new account
  // addUser(userData: { name: string; username: string; email: string; role: string; account_status: string;}): void {
  //   const user: User = {
  //     account_id: this.users.length + 1,
  //     name: userData.name,
  //     username: userData.username,
  //     email: userData.email,
  //     role: userData.role,
  //     account_status: userData.account_status,
  //   };

  //   this.users.push(user);
  //   this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
  //   this.updateDisplayedUsers();
  // }

  // onSubmit() {
  //   console.log('Form submitted');
  //   // Handle your form submission logic here
  // }

  switchView(view: 'users' | 'roles' | 'logs') {
    this.currentView = view;
    this.isCreatingUser = false;
    this.isCreatingRole = false;
    this.showUserProfile = false;
    this.showRoleEdit = false;
    this.selectedUser = null;
    this.selectedRole = null;

    // If switching to roles, ensure the roles component is initialized
    if (view === 'roles') {
      this.rolesComponent.initializeDummyData(); // Optional: Initialize data if needed
    }
  }

  onImageSelected(file: File | null): void {
    this.selectedImage = file;
    console.log('File received from child:', this.selectedImage);
  }

  updateUserProfile(updatedUser: User): void {
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      this.filteredUsers = this.filteredUsers.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
    }
    this.updateUserInDB(updatedUser.id, updatedUser)
  }

 async updateUserInDB(updatedUser_id: string, updatedUser: User) {
  if (!updatedUser_id) {
    console.error('User ID is required');
    return;
  }

  try {
    let imagePath: string | null = null;

    if (this.selectedImage) {
      console.log(this.selectedImage)
      imagePath = await this.SupabaseService.uploadProfileImage(this.selectedImage, updatedUser_id);
    }

    await this.SupabaseService.updateUser(updatedUser_id, {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      account_status: updatedUser.account_status,
      profile_image: imagePath || updatedUser.profile_image, // Update only if a new image is uploaded
    });

    alert('Profile updated successfully!');

    this.updateDisplayedUsers();
    this.showUserProfile = false;
    this.selectedUser = null;

  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile');
  }
 }

  onRoleEdit(role: RolesAndPermission): void {
    this.selectedRole = { ...role };
    this.showRoleEdit = true;
    this.showUserProfile = false;
    this.currentOpenActionId = null;
  }

  updateRole(updatedRole: RolesAndPermission): void {
    if (this.rolesComponent) {
      this.rolesComponent.updateRole(updatedRole);
    }
    this.backToTable();
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
