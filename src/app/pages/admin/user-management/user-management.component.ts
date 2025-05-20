import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { ConfirmationService, MessageService } from 'primeng/api'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { ToastModule } from 'primeng/toast'
import { BadgeModule } from 'primeng/badge'
import { TabViewModule } from 'primeng/tabview'
import { ConfirmDialog } from 'primeng/confirmdialog'
import { InputSwitchModule } from 'primeng/inputswitch'
import { UserService, User } from 'src/app/services/user.service'
import { DepartmentService, Office } from 'src/app/services/departments.service'
import { IconField } from 'primeng/iconfield'
import { InputIcon } from 'primeng/inputicon'

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    ToastModule,
    BadgeModule,
    TabViewModule,
    ConfirmDialog,
    InputSwitchModule,
    IconField,
    InputIcon
  ],
  providers: [ConfirmationService, MessageService]
})
export class UserManagementComponent implements OnInit {
  users: User[] = []
  offices: Office[] = []
  userDialog = false
  userForm!: FormGroup
  isUserEditMode = false
  selectedUserId: string | null = null
  userLoading = false
  userSubmitted = false
  deleteDialogVisible = false
  userToDelete: User | null = null

  userTypes = [
    { label: 'SuperAdmin', value: 'SuperAdmin' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Head', value: 'Head' },
    { label: 'User', value: 'User' }
  ]

  roles = [
    { label: 'End-User', value: 'enduser' },
    { label: 'BAC', value: 'bac' },
    { label: 'Budget', value: 'budget' },
    { label: 'Accounting', value: 'accounting' },
    { label: 'Supply', value: 'supply' },
    { label: 'Inspection', value: 'inspection' },
  ]

  officeDropdownOptions: { label: string; value: string }[] = []
position: any[]|undefined

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private userService: UserService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.initializeUserForm()
    this.loadUsers()
    this.loadOffices()
  }

  initializeUserForm() {
    this.userForm = this.fb.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      user_type: ['', Validators.required],
      position: ['', Validators.required],
      role: ['', Validators.required],
      officeId: ['', Validators.required]
    })
  }

  loadUsers() {
  this.userLoading = true
  this.userService.getAllUsers().subscribe({
    next: (data) => {
      // Replace officeId with office name so filtering works properly
      this.users = data.map(user => ({
        ...user,
        officeName: this.getOfficeName(user.officeId) // Add office name for filtering
      }))
      console.log('Users loaded:', this.users)
    },
    error: (error) => {
      console.error('Failed to load users:', error)
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' })
    },
    complete: () => {
      this.userLoading = false
    }
  })
}


  loadOffices() {
    this.offices = this.departmentService.getOffices()
    this.officeDropdownOptions = this.offices.map((office) => ({
      label: office.name,
      value: office.id ??  ''
    }))
  }

  openNewUserDialog() {
    this.isUserEditMode = false
    this.selectedUserId = null
    this.userForm.reset()
    this.userDialog = true
  }

  editUser(user: User) {
    this.isUserEditMode = true
    this.selectedUserId = user.id
    this.userForm.patchValue({
      fullname: user.fullname,
      username: user.username,
      password: user.password,
      user_type: user.user_type,
      position: user.position,
      role: user.role,
      officeId: user.officeId
    })
    this.userDialog = true
  }

 
  saveUser() {
  this.userSubmitted = true;

  if (this.userForm.valid) {
    const userData = this.userForm.value;

    if (this.isUserEditMode && this.selectedUserId) {
      // ✅ Update existing user
      this.userService.updateUser(this.selectedUserId, userData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
          this.loadUsers();
          this.userDialog = false;
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Operation failed' });
        },
        complete: () => {
          this.userSubmitted = false;
        }
      });
    } else {
      // ✅ Add new user
      this.userService.addUser(userData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
          this.loadUsers();
          this.userDialog = false;
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Operation failed' });
        },
        complete: () => {
          this.userSubmitted = false;
        }
      });
    }
  }
      }

      deleteUser(user: User) {
        this.userToDelete = user // Store user for deletion
        this.deleteDialogVisible = true // Show modal
      }

      confirmDeleteAction() {
        if (this.userToDelete) {
          this.userService.deleteUser(this.userToDelete.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully' })
              this.loadUsers()
              this.deleteDialogVisible = false // Close modal
              this.userToDelete = null // Reset selected user
            },
            error: (error) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to delete user' })
            }
          })
        }
      }


  hideUserDialog() {
    this.userDialog = false
    this.userForm.reset()
  }

  getOfficeName(officeId: string): string { 
    const office = this.offices.find(o => o.id === officeId)
    return office?.name || 'N/A'
  }
  
  
}
