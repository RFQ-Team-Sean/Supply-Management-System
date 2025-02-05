import { SupabaseService } from './../../../../core/services/supabase.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RolesAndPermission {
  id: number;
  role: string;
  num_of_users: number;
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

  constructor(private SupabaseService: SupabaseService) {}

  async ngOnInit() {
    this.initializeData();
    this.updateDisplayedLogs();
  }

  async initializeData(){
    this.rolesandpermissions = await this.SupabaseService.fetchRolesAndPermissions();
    this.totalPages = Math.ceil(this.rolesandpermissions.length / this.itemsPerPage);
    this.updateDisplayedLogs();
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

  async deleteRole(role: RolesAndPermission) {
    this.rolesandpermissions = this.rolesandpermissions.filter(r => r.id !== role.id);
    this.totalPages = Math.ceil(this.rolesandpermissions.length / this.itemsPerPage);
    await this.SupabaseService.deleteRoleAndPermission(role.id)
    this.updateDisplayedLogs();
  }

  searchLogs(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedLogs = this.rolesandpermissions.filter(role => 
      role.role.toLowerCase().includes(searchTerm) ||
      role.permission.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.updateDisplayedLogs();
  }

  applyFilters(filters: any): void {
    this.displayedLogs = this.rolesandpermissions.filter(role => {
      const matchesRoleType = !filters.roles.length || filters.roles.includes(role.role);
      const matchesPermission = !filters.permission || role.permission === filters.permission;
      return matchesRoleType && matchesPermission;
    });
    
    this.currentPage = 1;
    this.updateDisplayedLogs();
  }
}
