import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  updateRole(): void {
    this.roleData.last_modified = new Date().toISOString().split('T')[0];
    this.roleUpdated.emit(this.roleData);
  }

  cancelEdit(): void {
    this.closeEdit.emit();
  }
}
