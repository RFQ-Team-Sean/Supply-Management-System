import { Component, OnInit, ViewChild } from '@angular/core';  
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextarea } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LottieAnimationComponent } from "../../ui-components/lottie-animation/lottie-animation.component";
import { MaterialModule } from 'src/app/material.module';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { TabViewModule } from 'primeng/tabview';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SupplierDetails, QuotationRequest, SupplierItems } from 'src/app/schema/schema';
import { supplierDetailsList } from 'src/app/schema/dummy';
import { QuotationService } from 'src/app/services/quotation.service';
import { map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { CrudService } from 'src/app/services/crud.service';
import { environment } from 'src/environment/environment';

function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Allow empty values
    }
    
    const valid = /^\+639\d{9}$/.test(value);
    return valid ? null : { invalidPhoneNumber: true };
  };
}

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    ConfirmPopupModule,
    InputTextarea,
    LottieAnimationComponent,
    MaterialModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    FileUploadModule,
    TabViewModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService, ConfirmationService]
})

export class SuppliersComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dtResponses') dtResponses: Table | undefined;
  
  suppliers: SupplierDetails[] = [];
  selectedSupplier: SupplierDetails | undefined;
  showSupplierModal: boolean = false;
  searchValue: string = '';
  isLoading: boolean = false;

  showDetailsModal: boolean = false;
  showNotifyModal: boolean = false;
  showResponseDetailsModal: boolean = false;
  isSending: boolean = false;

  // Properties for quotation responses
  respondedQuotations: QuotationRequest[] = [];
  searchResponseValue: string = '';
  selectedRequest: QuotationRequest | undefined;

  supplierForm: FormGroup;
  notifyForm: FormGroup;
  selectedFiles: File[] = [];

  supplierItems: SupplierItems[] = [];

  // Add loading state for supplier items
  supplierItemsLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private quotationService: QuotationService,
    private userService: UserService,
    private crudService: CrudService
  ) {
    this.supplierForm = this.fb.group({
      contact_person: ['', Validators.required],
      contact_number: ['', [phoneNumberValidator()]],
      email: ['', [Validators.email]],
      address: [''],
      tin_number: ['', Validators.required],
      sec_number: ['', Validators.required],
      dti_number: ['', Validators.required],
      mayors_permit: ['', Validators.required]
    });

    // Initialize notify form
    this.notifyForm = this.fb.group({
      subject: ['Request for Quotation', Validators.required],
      message: ['', Validators.required],
      attachments: [[]]
    });
  }

  async fetchSuppliers(): Promise<void> {
    this.isLoading = true;
    try {
        const registeredSuppliers = await this.crudService.getAll(SupplierDetails);
        
        if (!environment.use || environment.use === 'local') {
            // Ensure dummy suppliers have required fields
            const validDummySuppliers = supplierDetailsList.map(supplier => ({
                ...supplier,
                contact_person: supplier.contact_person || 'Unknown',
                User_id: supplier.User_id || `DUMMY-${Math.random().toString(36).substr(2, 9)}`
            }));
            this.suppliers = [...registeredSuppliers, ...validDummySuppliers];
        } else {
            this.suppliers = registeredSuppliers;
        }

        // Filter out invalid suppliers
        this.suppliers = this.suppliers.filter(supplier => 
            supplier && supplier.User_id && (
                supplier.contact_person || 
                supplier.email || 
                supplier.contact_number
            )
        );

        // Remove duplicates
        this.suppliers = Array.from(new Map(
            this.suppliers.map(s => [s.User_id, s])
        ).values());

        // Sort suppliers
        this.suppliers.sort((a, b) => 
            (a.contact_person || '').localeCompare(b.contact_person || '')
        );

    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load suppliers: ' + (error.message || 'Unknown error')
      });
    } finally {
      this.isLoading = false;
    }
  }

  // Add real-time updates using CRUD service's live method
  setupLiveUpdates(): void {
    this.crudService.live(SupplierDetails).subscribe(() => {
      this.fetchSuppliers(); // Refresh the list when updates occur
    });
  }

  ngOnInit(): void {
    this.fetchSuppliers();
    this.setupLiveUpdates();
    this.fetchRespondedQuotations();
  }



  // Fetch responded quotations filtered by requester (end user)
  fetchRespondedQuotations(): void {
    const currentUser = this.userService.getUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not authenticated'
      });
      return;
    }
    
    // Get only quotations requested by the current user and have been responded to
    this.quotationService.getQuotationRequestsByRequester(userId).subscribe(requests => {
      // Filter to get only responded quotations (approved or rejected)
      this.respondedQuotations = requests.filter(req => 
        req.status === 'approved' || req.status === 'rejected'
      );
    });
  }

  // View details of a responded quotation
  viewRespondedQuotation(request: QuotationRequest): void {
    this.selectedRequest = request;
    this.showResponseDetailsModal = true;
  }

  openAddSupplierModal(): void {
    this.selectedSupplier = undefined;
    this.supplierForm.reset();
    this.showSupplierModal = true;
  }

  openEditSupplierModal(supplier: SupplierDetails): void {
    this.selectedSupplier = supplier;
    this.supplierForm.patchValue({
      contact_person: supplier.contact_person,
      contact_number: supplier.contact_number,
      email: supplier.email,
      address: supplier.address,
      tin_number: supplier.tin_number,
      sec_number: supplier.sec_number,
      dti_number: supplier.dti_number,
      mayors_permit: supplier.mayors_permit
    });
    this.showSupplierModal = true;
  }

  closeSupplierModal(): void {
    this.showSupplierModal = false;
  }

  addSupplier(): void {
    if (this.supplierForm.valid) {
      const newSupplier: SupplierDetails = this.supplierForm.value;
      // Implement your supplier creation logic here
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Supplier added successfully'
      });
      this.closeSupplierModal();
      this.fetchSuppliers();
    }
  }

  editSupplier(): void {
    if (this.supplierForm.valid && this.selectedSupplier) {
      const updatedSupplier: SupplierDetails = {
        ...this.selectedSupplier,
        ...this.supplierForm.value
      };
      
      // Implement your supplier update logic here
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Supplier updated successfully'
      });
      this.closeSupplierModal();
      this.fetchSuppliers();
    }
  }

  confirmDeleteSupplier(event: Event, id: string): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this supplier?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implement your supplier deletion logic here
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Supplier deleted successfully'
        });
        this.fetchSuppliers();
      }
    });
  }

  notifySupplier(supplier: SupplierDetails): void {
    this.selectedSupplier = supplier;
    this.showNotifyModal = true;
  }

  onFileSelect(event: any): void {
    if (event.files) {
      this.selectedFiles = event.files;
    }
  }

  onFileRemove(event: any): void {
    this.selectedFiles = this.selectedFiles.filter(file => file.name !== event.file.name);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  sendNotification(): void {
    if (this.notifyForm.valid && this.selectedSupplier) {
      this.isSending = true;
      
      const currentUser = this.userService.getUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User not authenticated'
        });
        return;
      }

      // Get file names for attachments
      const attachmentNames = this.selectedFiles.map(file => file.name);
      
      // Add the request to the service with requester ID
      // This now saves to localStorage automatically
      this.quotationService.addQuotationRequest({
        supplierId: this.selectedSupplier.User_id,
        subject: this.notifyForm.get('subject')?.value || '',
        message: this.notifyForm.get('message')?.value || '',
        attachments: attachmentNames,
        supplierName: this.selectedSupplier.contact_person,
        supplierContact: this.selectedSupplier.contact_number,
        supplierEmail: this.selectedSupplier.email
      }, userId);

      // Handle form data and file uploads (would typically be sent to a backend)
      const formData = new FormData();
      formData.append('supplierId', this.selectedSupplier.User_id);
      formData.append('subject', this.notifyForm.get('subject')?.value || '');
      formData.append('message', this.notifyForm.get('message')?.value || '');
      
      this.selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      // Simulate API call
      setTimeout(() => {
        this.isSending = false;
        this.showNotifyModal = false;
        this.notifyForm.reset();
        this.selectedFiles = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Quotation request sent to supplier'
        });
        
        // Refresh responded quotations to check for new responses
        this.fetchRespondedQuotations();
      }, 1000);
    }
  }

  approveQuotation(request: QuotationRequest): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to approve this quotation?',
      header: 'Approve Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const updates = {
          status: 'approved' as 'pending' | 'approved' | 'rejected'
        };
        
        // Update in service (saves to localStorage)
        this.quotationService.updateQuotationRequest(request.id, updates);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Approved',
          detail: 'Quotation has been approved'
        });
        
        // Refresh the list
        this.fetchRespondedQuotations();
      }
    });
  }

  rejectQuotation(request: QuotationRequest): void {
    this.selectedRequest = request;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to reject this quotation request?',
      header: 'Reject Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const updates = {
          status: 'rejected' as 'pending' | 'approved' | 'rejected',
          responseNotes: 'Request rejected',
          responseDate: new Date()
        };
        
        // Update in service (saves to localStorage)
        this.quotationService.updateQuotationRequest(this.selectedRequest!.id, updates);
        
        this.selectedRequest = { ...this.selectedRequest!, ...updates };
        
        setTimeout(() => {
          this.messageService.add({
            severity: 'info',
            summary: 'Rejected',
            detail: 'Quotation request has been rejected'
          });
          
          // Refresh the responded quotations list
          this.fetchRespondedQuotations();
        }, 1000);
      }
    });
  }

  async viewSupplierDetails(supplier: SupplierDetails): Promise<void> {
    this.selectedSupplier = supplier;
    this.showDetailsModal = true;
    this.supplierItemsLoading = true;
    
    try {
        this.supplierItems = await this.crudService.getAll(SupplierItems, {
            filter: { warehouse: supplier.User_id }
        });
    } catch (error) {
        console.error('Error loading supplier items:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load supplier products'
        });
    } finally {
        this.supplierItemsLoading = false;
    }
}

  // Add method to check if supplier is registered
  isRegisteredSupplier(supplier: SupplierDetails): boolean {
    return !supplier.User_id.startsWith('DUMMY-');
  }
}