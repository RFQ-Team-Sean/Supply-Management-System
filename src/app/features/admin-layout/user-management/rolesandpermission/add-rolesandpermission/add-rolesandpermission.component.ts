import { Component, Output, EventEmitter } from '@angular/core';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-rolesandpermission',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-rolesandpermission.component.html',
  styleUrls: ['./add-rolesandpermission.component.css']
})
export class AddRolesandpermissionComponent {
  @Output() roleCreated = new EventEmitter<{ roles: string; permission: string }>();

  role: string = '';
  permission: string = '';

  constructor(private SupabaseService: SupabaseService) {}

  async createRole(): Promise<void> {
    try {
      await this.SupabaseService.addRoleAndPermission(this.role, this.permission);
      this.roleCreated.emit({ roles: this.role, permission: this.permission });
      this.role = '';
      this.permission = '';
      console.log('Role and permission added successfully');
    } catch (error) {
      console.error('Error adding role and permission:', error);
    }
  }
}
