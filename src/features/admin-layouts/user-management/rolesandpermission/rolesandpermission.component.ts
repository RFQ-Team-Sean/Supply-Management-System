import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RolesAndPermission {
  id: number;
  roles: string;
  number_of_users: number;
  permission: string;
  last_modified: string;
}

@Component({
  selector: 'app-rolesandpermission',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
  ],
  templateUrl: './rolesandpermission.component.html',
  styleUrls: ['./rolesandpermission.component.css']
})
export class RolesandpermissionComponent implements OnInit {
  rolesandpermissions: RolesAndPermission[] = [];
  displayedLogs: RolesAndPermission[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  selectedRole: RolesAndPermission | null = null;
  showRoleEdit: boolean = false;

  permissionLevels = ['Full Access', 'View Only', 'Edit Access', 'Limited Access'];

  selectedRoleType: string | null = null;
  selectedPermission: string | null = null;

  @Output() roleEditRequested = new EventEmitter<RolesAndPermission>();

  ngOnInit(): void {
    this.initializeDummyData();
    this.updateDisplayedLogs();
  }

  initializeDummyData(): void {
    this.rolesandpermissions = [
      { id: 1, roles: 'GSO Officer', number_of_users: 5, permission: 'Full Access', last_modified: '2023-10-01' },
      { id: 2, roles: 'Department Staff', number_of_users: 3, permission: 'Edit Access', last_modified: '2023-10-02' },
      { id: 3, roles: 'BAC Staff', number_of_users: 10, permission: 'View Only', last_modified: '2023-10-03' },
      { id: 4, roles: 'Property Officer', number_of_users: 2, permission: 'Edit Access', last_modified: '2023-10-04' },
      { id: 5, roles: 'GSO Officer', number_of_users: 4, permission: 'Manage Users', last_modified: '2023-10-05' },
      { id: 6, roles: 'Department Staff', number_of_users: 6, permission: 'Limited Access', last_modified: '2023-10-06' },
      { id: 7, roles: 'BAC Staff', number_of_users: 15, permission: 'View Only', last_modified: '2023-10-07' },
      { id: 8, roles: 'Property Officer', number_of_users: 1, permission: 'Full Access', last_modified: '2023-10-08' },
      { id: 9, roles: 'GSO Officer', number_of_users: 8, permission: 'Limited Access', last_modified: '2023-10-09' },
      { id: 10, roles: 'Department Staff', number_of_users: 3, permission: 'Edit Access', last_modified: '2023-10-10' },
      { id: 11, roles: 'BAC Staff', number_of_users: 2, permission: 'View Only', last_modified: '2023-10-11' },
      { id: 12, roles: 'Property Officer', number_of_users: 4, permission: 'Full Access', last_modified: '2023-10-12' },
      { id: 13, roles: 'GSO Officer', number_of_users: 5, permission: 'Edit Access', last_modified: '2023-10-13' },
      { id: 14, roles: 'Department Staff', number_of_users: 7, permission: 'Limited Access', last_modified: '2023-10-14' },
      { id: 15, roles: 'BAC Staff', number_of_users: 2, permission: 'Full Access', last_modified: '2023-10-15' }
    ];
    this.totalPages = Math.ceil(this.rolesandpermissions.length / this.itemsPerPage);
  }

  updateDisplayedLogs(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedLogs = this.rolesandpermissions.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedLogs();
  }

  toggleActions(role: RolesAndPermission): void {
    this.currentOpenActionId = this.currentOpenActionId === role.id ? null : role.id;
  }

  editRole(role: RolesAndPermission): void {
    this.roleEditRequested.emit(role);
    this.currentOpenActionId = null;
  }

  updateRole(updatedRole: RolesAndPermission): void {
    const index = this.rolesandpermissions.findIndex(r => r.id === updatedRole.id);
    if (index !== -1) {
      this.rolesandpermissions[index] = updatedRole;
      this.updateDisplayedLogs();
    }
  }

  closeEdit(): void {
    this.showRoleEdit = false;
    this.selectedRole = null;
  }

  deleteRole(role: RolesAndPermission): void {
    this.rolesandpermissions = this.rolesandpermissions.filter(r => r.id !== role.id);
    this.totalPages = Math.ceil(this.rolesandpermissions.length / this.itemsPerPage);
    this.updateDisplayedLogs();
  }

  searchLogs(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedLogs = this.rolesandpermissions.filter(role => 
      role.roles.toLowerCase().includes(searchTerm) ||
      role.permission.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.updateDisplayedLogs();
  }

  applyFilters(filters: any): void {
    this.displayedLogs = this.rolesandpermissions.filter(role => {
      const matchesRoleType = !filters.roles.length || filters.roles.includes(role.roles);
      const matchesPermission = !filters.permission || role.permission === filters.permission;
      return matchesRoleType && matchesPermission;
    });
    
    this.currentPage = 1;
    this.updateDisplayedLogs();
  }
}
