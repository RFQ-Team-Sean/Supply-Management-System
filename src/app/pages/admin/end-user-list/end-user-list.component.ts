import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { UserService, User } from 'src/app/services/user.service';
import { DepartmentService, Office } from 'src/app/services/departments.service';
import { EndUserListService, EndUserRecord } from 'src/app/services/end-user-list.service';

@Component({
  selector: 'app-end-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './end-user-list.component.html',
  styleUrls: ['./end-user-list.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class EndUserListComponent implements OnInit {
  allUsers: User[] = []; // All users from user.service.ts
  endUsers: User[] = []; // Only end users with assigned offices
  endUserRecords: EndUserRecord[] = []; // Links between users and offices
  loading = false;
  dialogVisible = false;
  endUserForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  selectedRecordId: string | null = null;

  // For dropdowns
  userDropdown: { label: string; value: string }[] = [];
  officeDropdown: { label: string; value: string }[] = [];
  offices: any;

  constructor(
    private endUserListService: EndUserListService,
    private userService: UserService,
    private departmentService: DepartmentService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    this.buildForm();
    await this.loadData();
  }

  buildForm() {
    this.endUserForm = this.fb.group({
      userId: ['', Validators.required],
      officeId: ['', Validators.required]
    });
  }

  async loadData() {
    this.loading = true;

    // Load all users
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers = users;

      // Load offices
      this.departmentService.getAllOffices().then(offices => {
        this.offices = offices;

        // Filter end users and map office names
        this.endUsers = this.allUsers
          .filter(user => user.role === 'enduser')
          .map(user => ({
            ...user,
            officeName: this.getOfficeName(user.officeId) // Map officeId to officeName
          }));

        this.loading = false;
      }).catch(error => {
        console.error('Error loading offices:', error);
        this.loading = false;
      });
    });
  }

  // Helper function to get office name by officeId
  getOfficeName(officeId: string): string {
    const office = this.offices.find((o: { id: string; }) => o.id === officeId);
    return office ? office.name : 'Unknown Office';
  }
  // =========================
  // CRUD
  // =========================
  openNew() {
    this.isEditMode = false;
    this.submitted = false;
    this.selectedRecordId = null;
    this.endUserForm.reset();
    this.dialogVisible = true;
  }

  editAssignment(userId: string) {
    const record = this.endUserRecords.find(rec => rec.userId === userId);
    if (record) {
      this.isEditMode = true;
      this.selectedRecordId = record.id!;
      this.endUserForm.patchValue({
        userId: record.userId,
        officeId: record.officeId
      });
      this.dialogVisible = true;
    }
  }

  deleteAssignment(userId: string) {
    const record = this.endUserRecords.find(rec => rec.userId === userId);
    if (record) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this assignment?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.endUserListService.deleteRecord(record.id!);
          this.loadData();
          this.messageService.add({ 
            severity: 'success',
            summary: 'Success',
            detail: 'Assignment deleted'
          });
        }
      });
    }
  }

  hideDialog() {
    this.dialogVisible = false;
    this.submitted = false;
    this.endUserForm.reset();
  }

  saveEndUser() {
    this.submitted = true;
    if (this.endUserForm.valid) {
      const formData = this.endUserForm.value; // userId, officeId
      try {
        if (this.isEditMode && this.selectedRecordId) {
          this.endUserListService.updateRecord(this.selectedRecordId, formData);
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Assignment updated'
          });
        } else {
          this.endUserListService.addRecord(formData);
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Assignment created'
          });
        }
        this.dialogVisible = false;
        this.endUserForm.reset();
        this.loadData();
      } catch (err: any) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message
        });
      }
    }
  }

  // =========================
  // Display Helpers
  // =========================
  getUserLabel(userId: string): string {
    const user = this.allUsers.find(u => u.id === userId);
    return user ? `${user.fullname} (${user.role})` : 'Unknown User';
  }

  getOfficeLabel(officeId: string): string {
    const office = this.officeDropdown.find(o => o.value === officeId);
    return office ? office.label : 'Unknown Office';
  }

  // Get the office assigned to a user
  getAssignedOffice(userId: string): string {
    const record = this.endUserRecords.find(rec => rec.userId === userId);
    return record ? this.getOfficeLabel(record.officeId) : 'Not Assigned';
  }
}