import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateUserComponent } from '../create-user/create-user.component';
import { AddRolesandpermissionComponent } from '../rolesandpermission/add-rolesandpermission/add-rolesandpermission.component';

@Component({
  selector: 'app-user-filter',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CreateUserComponent,
    AddRolesandpermissionComponent
  ],
  templateUrl: './user-filter.component.html',
  styleUrl: './user-filter.component.css'
})
export class UserFilterComponent implements OnChanges {
  @Input() currentView: 'users' | 'roles' | 'logs' = 'users';
  @Output() filterChanged = new EventEmitter<any>();
  @Output() userCreated = new EventEmitter<any>();
  @Output() roleCreated = new EventEmitter<any>();
  @Output() createRoleClicked = new EventEmitter<void>();

  isCreatingUser = false;
  isCreatingRole = false;
  
  // User filters
  userRoles = ['GSO Officer', 'Department Staff', 'BAC Staff', 'Property Officer'];
  userStatuses = ['Active', 'Inactive'];
  
  // Role filters
  roleTypes = ['GSO Officer', 'Department Staff', 'BAC Staff', 'Property Officer'];
  permissionLevels = ['Full Access', 'View Only', 'Edit Access', 'Limited Access'];
  selectedRoleType: string | null = null;
  selectedPermission: string | null = null;
  
  selectedRoles: string[] = [];
  selectedStatus: string | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentView'] && !changes['currentView'].firstChange) {
      this.isCreatingUser = false;
      this.isCreatingRole = false;
      this.resetFilters();
    }
  }

  resetFilters() {
    if (this.currentView === 'users') {
      this.selectedRoles = [];
      this.selectedStatus = null;
    } else if (this.currentView === 'roles') {
      this.selectedRoleType = null;
      this.selectedPermission = null;
    }
    this.applyFilters();
  }

  applyFilters() {
    if (this.currentView === 'users') {
      this.filterChanged.emit({
        roles: this.selectedRoles,
        status: this.selectedStatus
      });
    } else if (this.currentView === 'roles') {
      this.filterChanged.emit({
        roleType: this.selectedRoleType,
        permission: this.selectedPermission
      });
    }
  }

  createUser() {
    this.isCreatingUser = !this.isCreatingUser;
  }

  createRole() {
    this.isCreatingRole = !this.isCreatingRole;
    this.isCreatingUser = false;
  }

  onUserCreated(userData: any) {
    this.userCreated.emit(userData);
    this.isCreatingUser = false;
  }

  onCancelCreate() {
    this.isCreatingUser = false;
  }

  onRoleCreated(roleData: any) {
    this.roleCreated.emit(roleData);
    this.isCreatingRole = false;
  }

  onCancelRole() {
    this.isCreatingRole = false;
  }
}
