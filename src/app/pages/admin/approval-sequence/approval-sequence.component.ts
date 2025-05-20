import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ApprovalSequenceService, ApprovalSequence } from 'src/app/services/approval-sequence.service';
import { UserService, User } from 'src/app/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-approval-sequence',
  standalone: true,
  imports: [
    MaterialModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ConfirmDialogModule,
    DropdownModule,
    InputSwitchModule,
    TabViewModule,
    ToastModule,
    TableModule,
  ],
  templateUrl: './approval-sequence.component.html',
  providers: [MessageService, ConfirmationService],
})
export class ApprovalSequenceComponent implements OnInit {
  sequences: ApprovalSequence[] = []; // Combined list of procurement and supply sequences
  approverForm!: FormGroup;
  approverDialog = false;
  isEditMode = false;
  currentApproverId: string | null = null;
  submitted = false;
  loading = false;
  availableUsers: any[] = [];

  departments = [
    { name: 'Budget Unit', code: 'BUDGET' },
    { name: 'FACTO', code: 'FACTO' },
    { name: 'CSO', code: 'CSO' },
    { name: 'OCCP', code: 'OCCP' },
    { name: 'BAC', code: 'BAC' },
    { name: 'Supply Management', code: 'SUPPLY' },
  ];

  roles = [
    { name: 'Budget Officer', code: 'accounting' },
    { name: 'FACTO Officer', code: 'accounting' },
    { name: 'CSO Officer', code: 'accounting' },
    { name: 'OCCP Officer', code: 'accounting' },
    { name: 'BAC Chairman', code: 'bac' },
    { name: 'Supply Officer', code: 'supply' },
    { name: 'Property Custodian', code: 'supply' },
    { name: 'Supply Head', code: 'supply' },
  ];

  types = [
    { label: 'Procurement', value: 'procurement' },
    { label: 'Supply', value: 'supply' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private approvalSequenceService: ApprovalSequenceService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSequences();
  }

  initializeForm(): void {
    this.approverForm = this.formBuilder.group({
      name: ['', Validators.required],
      level: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      department: ['', Validators.required],
      role: ['', Validators.required],
      user: ['', Validators.required],
      type: ['procurement', Validators.required], // Default to 'procurement'
      isActive: [true],
    });
  }

  loadSequences(): void {
    this.loading = true;
    this.approvalSequenceService.getAllSequences().subscribe({
      next: (sequences) => {
        this.sequences = sequences;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sequences',
        });
        this.loading = false;
      },
    });
  }

  onRowReorder(event: any): void {
    // Update the levels based on the new order
    this.sequences.forEach((seq, index) => {
      seq.level = index + 1;
    });

    // Save the updated sequences
    this.approvalSequenceService.updateSequences(this.sequences).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Sequences reordered successfully!',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reorder sequences',
        });
      },
    });
  }

  openNewApproverDialog(): void {
    this.approverForm.reset();
    this.approverForm.patchValue({ isActive: true, level: this.getNextLevel(), type: 'procurement' });
    this.isEditMode = false;
    this.approverDialog = true;
  }

  getNextLevel(): number {
    return this.sequences.length > 0 ? this.sequences[this.sequences.length - 1].level + 1 : 1;
  }

  editApprover(approver: ApprovalSequence): void {
    this.approverForm.patchValue({
      name: approver.name,
      level: approver.level,
      department: this.departments.find((d) => d.code === approver.departmentCode),
      role: this.roles.find((r) => r.code === approver.roleCode),
      user: this.availableUsers.find((u) => u.id === approver.userId),
      type: approver.type,
      isActive: approver.isActive,
    });
    this.isEditMode = true;
    this.currentApproverId = approver.id || null;
    this.approverDialog = true;
  }

  saveApprover(): void {
    this.submitted = true;

    if (this.approverForm.invalid) {
      return;
    }

    const formValue = this.approverForm.value;
    const type = formValue.type;
    const level = formValue.level;

    // Validate level based on type
    if (type === 'procurement' && (level < 1 || level > 4)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'For procurement, level must be between 1 and 4.',
      });
      return;
    }

    if (type === 'supply' && (level < 5 || level > 10)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'For supply, level must be between 5 and 10.',
      });
      return;
    }

    const sequenceData = {
      name: formValue.name,
      level: formValue.level,
      departmentCode: formValue.department.code,
      departmentName: formValue.department.name,
      roleCode: formValue.role.code,
      roleName: formValue.role.name,
      userId: formValue.user.id,
      userFullName: formValue.user.fullname,
      type: formValue.type, // Use the selected type
      isActive: formValue.isActive,
    };

    if (this.isEditMode && this.currentApproverId) {
      this.approvalSequenceService
        .updateSequence(this.currentApproverId, sequenceData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Approval sequence updated successfully!',
            });
            this.loadSequences();
            this.hideDialog();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to update sequence',
            });
          },
        });
    } else {
      this.approvalSequenceService
        .addSequence(sequenceData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'New approval sequence added successfully!',
            });
            this.loadSequences();
            this.hideDialog();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to add sequence',
            });
          },
        });
    }
  }

  deleteApprover(approver: ApprovalSequence): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this approval sequence?',
      accept: () => {
        this.loading = true;
        this.approvalSequenceService
          .deleteSequence(approver.id!)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Approval sequence deleted',
              });
              this.loadSequences();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to delete sequence',
              });
            },
          });
      },
    });
  }

  hideDialog(): void {
    this.approverDialog = false;
    this.submitted = false;
    this.approverForm.reset();
    this.availableUsers = [];
  }
}