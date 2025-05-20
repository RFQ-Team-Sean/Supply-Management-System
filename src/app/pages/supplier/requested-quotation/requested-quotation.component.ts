import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { InputTextarea } from 'primeng/inputtextarea';
import { MaterialModule } from 'src/app/material.module';
import { QuotationRequest } from 'src/app/schema/schema';
import { QuotationService } from 'src/app/services/quotation.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from 'src/app/services/user.service';
import { SupplierItems } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-requested-quotation',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextarea,
    MaterialModule,
    ConfirmDialogModule
  ],
  templateUrl: './requested-quotation.component.html',
  styleUrl: './requested-quotation.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class RequestedQuotationComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  
  quotationRequests: QuotationRequest[] = [];
  isLoading: boolean = false;
  searchValue: string = '';
  
  selectedRequest: QuotationRequest | undefined;
  showDetailsModal: boolean = false;
  showResponseModal: boolean = false;
  showRejectModal: boolean = false;
  
  responseForm: FormGroup;
  rejectForm: FormGroup;

  // Change this property type
  supplierItems: SupplierItems[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private quotationService: QuotationService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private crudService: CrudService
  ) {
    this.responseForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(0)]],
      estimatedDeliveryDate: ['', Validators.required],
      notes: ['']
    });
    
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchQuotationRequests();
  }

  fetchQuotationRequests(): void {
    this.isLoading = true;
    
    const currentUser = this.userService.getUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not authenticated'
      });
      this.isLoading = false;
      return;
    }
    
    // Get quotations for this supplier only
    this.quotationService.getQuotationRequestsBySupplier(userId).subscribe(requests => {
      this.quotationRequests = requests;
      this.isLoading = false;
    });
  }

  async viewRequestDetails(request: QuotationRequest): Promise<void> {
    this.selectedRequest = request;
    
    // Load supplier's inventory items
    try {
      const currentUser = this.userService.getUser();
      if (currentUser?.id) {
        // Get items where warehouse matches supplier name
        this.supplierItems = await this.crudService.getAll(SupplierItems, {
          filter: { warehouse: currentUser.id }
        });
      }
    } catch (error) {
      console.error('Error loading supplier items:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load supplier products'
      });
    }
    
    this.showDetailsModal = true;
  }

  openResponseModal(request: QuotationRequest): void {
    this.selectedRequest = request;
    this.responseForm.reset();
    this.showResponseModal = true;
  }

  submitResponse(): void {
    if (this.responseForm.valid && this.selectedRequest) {
      const updates = {
        status: 'approved' as 'pending' | 'approved' | 'rejected',
        price: this.responseForm.get('price')?.value,
        estimatedDeliveryDate: this.responseForm.get('estimatedDeliveryDate')?.value,
        responseNotes: this.responseForm.get('notes')?.value,
        responseDate: new Date()
      };
      
      // Update the quotation request (this now saves to localStorage automatically)
      this.quotationService.updateQuotationRequest(this.selectedRequest.id, updates);
      
      this.selectedRequest = { ...this.selectedRequest, ...updates };
      
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Quotation response submitted successfully'
        });
        
        // Refresh the local list of quotation requests
        this.fetchQuotationRequests();
        
        this.showResponseModal = false;
      }, 1000);
    }
  }

  rejectQuotation(request: QuotationRequest): void {
    this.selectedRequest = request;
    this.rejectForm.reset();
    this.showRejectModal = true;
  }

  submitRejection(): void {
    if (this.rejectForm.valid && this.selectedRequest) {
      const updates = {
        status: 'rejected' as 'pending' | 'approved' | 'rejected',
        responseNotes: this.rejectForm.get('reason')?.value,
        responseDate: new Date()
      };
      
      // Update the quotation request (this now saves to localStorage automatically)
      this.quotationService.updateQuotationRequest(this.selectedRequest.id, updates);
      
      this.selectedRequest = { ...this.selectedRequest, ...updates };
      
      setTimeout(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Quotation request has been rejected'
        });
        
        // Refresh the local list of quotation requests
        this.fetchQuotationRequests();
        
        this.showRejectModal = false;
      }, 1000);
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }
}
