import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';

interface RolesAndPermission {
  id: number;
  role: string;
  num_of_users: number;
  permission: string;
  last_modified: string;
}

@Component({
  selector: 'app-edit-rolesandpermission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-rolesandpermission.component.html',
})
export class EditRolesandpermissionComponent {
  @Input() roleData!: RolesAndPermission;
  @Output() roleUpdated = new EventEmitter<RolesAndPermission>();
  @Output() closeEdit = new EventEmitter<void>();

  permissionLevels: string[] = ['Full Access', 'View Only', 'Edit Access', 'Limited Access'];

  constructor(private SupabaseService: SupabaseService) {}

  updateRole(): void {
    this.roleData.last_modified = new Date().toISOString().split('T')[0];
    this.updateRolesAndPermissionsInDB(this.roleData)
    this.roleUpdated.emit(this.roleData);
  }

  async updateRolesAndPermissionsInDB(roleData: RolesAndPermission) {
    try {
      const updates = {
        role: roleData.role,
        permission: roleData.permission,
        num_of_users: roleData.num_of_users ?? 0,
        last_modified: new Date().toISOString().split('T')[0]
      };
      await this.SupabaseService.updateRoleAndPermission(roleData.id, updates);
      console.log('Record updated successfully');
  
    } catch (error) {
      console.error('Error updating record:', error);

    }
  }

  cancelEdit(): void {
    this.closeEdit.emit();
  }
}
