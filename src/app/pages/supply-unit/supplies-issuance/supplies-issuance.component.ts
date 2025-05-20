import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

interface IssuanceRequest {
  id: string;
  requestNumber: string;
  department: string;
  requestedBy: string;
  requestDate: Date;
  purpose: string;
  items: IssuanceItem[];
  status: 'pending' | 'approved' | 'rejected';
  remarks: string;
}

interface IssuanceItem {
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  available: number;
}

@Component({
  selector: 'app-supplies-issuance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TooltipModule,
    DividerModule,
    ConfirmPopupModule,
    InputNumberModule,
    DropdownModule,
    ToastModule,
    TextareaModule,
    CalendarModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './supplies-issuance.component.html',
  styleUrls: ['./supplies-issuance.component.scss']
})
export class SuppliesIssuanceComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  requests: IssuanceRequest[] = [];
  showRequestDialog: boolean = false;
  showItemDialog: boolean = false;
  isEditing: boolean = false;
  selectedRequest: IssuanceRequest | null = null;
  searchValue: string = '';

  requestForm = new FormGroup({
    department: new FormControl('', Validators.required),
    requestedBy: new FormControl('', Validators.required),
    requestDate: new FormControl<Date | null>(new Date(), Validators.required),
    purpose: new FormControl('', Validators.required),
    remarks: new FormControl('')
  });

  itemForm = new FormGroup({
    itemName: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    unit: new FormControl('', Validators.required)
  });

  currentItems: IssuanceItem[] = [];

  unitOptions = [
    { label: 'Piece', value: 'pc' },
    { label: 'Box', value: 'box' },
    { label: 'Pack', value: 'pack' },
    { label: 'Ream', value: 'ream' },
    { label: 'Set', value: 'set' },
    { label: 'Roll', value: 'roll' },
    { label: 'Bottle', value: 'bottle' }
  ];

  departmentOptions = [
    { label: 'Human Resources', value: 'HR' },
    { label: 'Information Technology', value: 'IT' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Operations', value: 'Operations' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Administration', value: 'Admin' }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    // Load initial data if needed
  }

  openNewDialog() {
    this.isEditing = false;
    this.selectedRequest = null;
    this.requestForm.reset();
    this.currentItems = [];
    this.requestForm.patchValue({
      requestDate: new Date()
    });
    this.showRequestDialog = true;
  }

  openItemDialog() {
    this.itemForm.reset();
    this.showItemDialog = true;
  }

  addItem() {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      const newItem: IssuanceItem = {
        itemName: formValue.itemName || '',
        description: formValue.description || '',
        quantity: formValue.quantity || 0,
        unit: formValue.unit || '',
        available: 100 // This should be fetched from inventory
      };

      this.currentItems.push(newItem);
      this.showItemDialog = false;
      this.itemForm.reset();
    }
  }

  removeItem(index: number) {
    this.currentItems.splice(index, 1);
  }

  editRequest(request: IssuanceRequest) {
    this.isEditing = true;
    this.selectedRequest = request;
    this.currentItems = [...request.items];
    this.requestForm.patchValue({
      department: request.department,
      requestedBy: request.requestedBy,
      requestDate: new Date(request.requestDate),
      purpose: request.purpose,
      remarks: request.remarks
    });
    this.showRequestDialog = true;
  }

  deleteRequest(event: Event, request: IssuanceRequest) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this request?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.requests = this.requests.filter(r => r.id !== request.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Issuance request deleted successfully'
        });
      }
    });
  }

  saveRequest() {
    if (this.requestForm.valid && this.currentItems.length > 0) {
      const formValue = this.requestForm.value;
      
      const request: IssuanceRequest = {
        id: this.selectedRequest?.id || crypto.randomUUID(),
        requestNumber: this.selectedRequest?.requestNumber || `IR-${new Date().getTime()}`,
        department: formValue.department || '',
        requestedBy: formValue.requestedBy || '',
        requestDate: formValue.requestDate || new Date(),
        purpose: formValue.purpose || '',
        items: [...this.currentItems],
        remarks: formValue.remarks || '',
        status: 'pending'
      };

      if (this.isEditing && this.selectedRequest) {
        const index = this.requests.findIndex(r => r.id === this.selectedRequest?.id);
        this.requests[index] = request;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Issuance request updated successfully'
        });
      } else {
        this.requests.push(request);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Issuance request created successfully'
        });
      }

      this.showRequestDialog = false;
      this.requestForm.reset();
      this.currentItems = [];
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.currentItems.length === 0 ? 'Please add at least one item' : 'Please fill in all required fields'
      });
    }
  }

  approveRequest(request: IssuanceRequest) {
    request.status = 'approved';
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Issuance request approved successfully'
    });
  }

  rejectRequest(request: IssuanceRequest) {
    request.status = 'rejected';
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Issuance request rejected'
    });
  }

  hideDialog() {
    this.showRequestDialog = false;
    this.requestForm.reset();
    this.currentItems = [];
  }

  hideItemDialog() {
    this.showItemDialog = false;
    this.itemForm.reset();
  }

  getSeverity(status: string): 'success' | 'danger' | 'warn' {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'warn';
    }
  }
}
