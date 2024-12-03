import { Component, Output, EventEmitter } from '@angular/core';
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

  roles: string = '';
  permission: string = '';

  createRole(): void {
    this.roleCreated.emit({ roles: this.roles, permission: this.permission });
    this.roles = '';
    this.permission = '';
  }
}
