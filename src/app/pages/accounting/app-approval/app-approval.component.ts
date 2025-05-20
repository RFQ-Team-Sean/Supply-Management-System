import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PdfGeneratorService } from 'src/app/services/pdf-generator.service';
import { ProgressTableComponent, ProgressTableData } from 'src/app/components/progress-table/progress-table.component';
import { 
  PPMPProjectData, 
  FundSourceData, 
  APPData,
  UsersData 
} from 'src/app/schema/dummy'; 
import { APP } from 'src/app/schema/schema';

// Fixed interface for the APP document records
export interface APPDocument {
  [x: string]: any;
  id: string;
  documentName: string;
  type: string;
  submissionDate: Date;
  submittedBy: string;
  reviewer: string;
  reviewDate: Date | null;
  ppmp: string;
  app: string;
  fiscal_year: number;
  total_estimated_cost: number;
  status: 'DRAFT' | 'FOR_REVIEW' | 'APPROVED';
}

// Service to interact with the Annual Procurement Plan data
export class AnnualProcurementPlanService {
  async getAPPDocuments(): Promise<APPDocument[]> {
    // In a real app, this would fetch from your API
    // For now, generate sample data based on your PPMPProjectData
    
    return PPMPProjectData.map(project => {
      const submittedBy = UsersData.find(u => u.id === '6')?.fullname || 'Diana Green';
      const reviewer = UsersData.find(u => u.id === '2')?.fullname || 'Jane Smith';
      
      // Create a document record for each project
      return {
        id: project.id.replace('PROJ', 'APP'),
        documentName: `${project.project_title}`,
        type: 'Procurement Document',
        fiscal_year:  2025,
        submissionDate: new Date(2025, 0, Math.floor(Math.random() * 28) + 1), // Random date in Jan 2025
        submittedBy: submittedBy,
        reviewer: reviewer,
        reviewDate: project.status === 'APPROVED' ? new Date(2025, 1, Math.floor(Math.random() * 28) + 1) : null, // Random date in Feb 2025 if approved
        ppmp: project.id,
        app: project.id.replace('PROJ', 'APP'),
        total_estimated_cost: project.abc || 0,
        status: project.status as 'DRAFT' | 'FOR_REVIEW' | 'APPROVED'
      };
    });
  }

  async approveAPP(id: string): Promise<void> {
    console.log(`Approving APP with ID: ${id}`);
  }

  async submitForReview(id: string): Promise<void> {
    console.log(`Submitting APP with ID: ${id} for review`);
  }
}

@Component({
  selector: 'app-app-approval',
  standalone: true,
  imports: [
    ConfirmPopupModule, 
    ProgressTableComponent, 
    CommonModule, 
    ToastModule, 
    DialogModule, 
    MenuModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [MessageService, ConfirmationService, CurrencyPipe, DatePipe, AnnualProcurementPlanService],
  templateUrl: './app-approval.component.html',
  styleUrls: ['./app-approval.component.scss'],
})
export class AppApprovalComponent implements OnInit {
  appDocuments: APPDocument[] = [];
  showAPPModal: boolean = false;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  editingDocument: APPDocument | null = null;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private pdfService: PdfGeneratorService,
    private appService: AnnualProcurementPlanService
  ) {}

  ngOnInit(): void {
    this.fetchItems();
  }

  async approveAPP(event: Event, document: APPDocument): Promise<void> {
    try {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to approve this Annual Procurement Plan?',
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
        },
        acceptButtonProps: {
          label: 'Approve'
        },
        accept: async () => {
          this.progressTable.dataLoaded = false;
          await this.appService.approveAPP(document.id);
          
          // Update the document status locally
          const index = this.appDocuments.findIndex(doc => doc.id === document.id);
          if (index !== -1) {
            this.appDocuments[index].status = 'APPROVED';
            this.appDocuments[index].reviewDate = new Date();
          }
          
          this.progressTable.data = [...this.appDocuments];
          this.progressTable.dataLoaded = true;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully approved the Annual Procurement Plan.` });
        },
        reject: () => {
          // Do nothing on reject
        }
      });
    } catch (e: any) {
      alert(e.message);
      this.progressTable.dataLoaded = true;
    }
  }

  async submitForReview(event: Event, document: APPDocument): Promise<void> {
    try {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to submit this Annual Procurement Plan for review?',
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
        },
        acceptButtonProps: {
          label: 'Submit'
        },
        accept: async () => {
          this.progressTable.dataLoaded = false;
          await this.appService.submitForReview(document.id);
          
          // Update the document status locally
          const index = this.appDocuments.findIndex(doc => doc.id === document.id);
          if (index !== -1) {
            this.appDocuments[index].status = 'FOR_REVIEW';
          }
          
          this.progressTable.data = [...this.appDocuments];
          this.progressTable.dataLoaded = true;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully submitted plan for review.` });
        },
        reject: () => {
          // Do nothing on reject
        }
      });
    } catch (e: any) {
      alert(e.message);
      this.progressTable.dataLoaded = true;
    }
  }

  printDocument(event: Event, document: APPDocument): void {
    try {
      // Using just the existing method to avoid the generateProcurementPlan error
      // Map APP status to disbursement voucher status
      let voucherStatus: 'pending' | 'processing' | 'recorded';
      
      switch(document.status) {
        case 'DRAFT':
          voucherStatus = 'pending';
          break;
        case 'FOR_REVIEW':
          voucherStatus = 'processing';
          break;
        case 'APPROVED':
          voucherStatus = 'recorded';
          break;
        default:
          voucherStatus = 'pending'; // Default fallback
      }
      
      const blob = this.pdfService.generateDisbursementVoucher({
        voucherNo: document.id,
        supplierName: document.submittedBy,
        totalAmountDue: document.total_estimated_cost || 0,
        deliveryReceiptNo: document.app,
        status: voucherStatus,
        date: new Date(),
        paymentMethod: '',
        itemizedDetails: []
      });
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document['createElement']('a') as HTMLAnchorElement;
        link.href = url;
        link.download = `annual-procurement-plan-${document.id}.pdf`;
        link.click();
        
        this.messageService.add({ 
          severity: 'info', 
          summary: 'Download Started', 
          detail: 'Your document is being downloaded.' 
        });
      } else {
        throw new Error('Unable to generate PDF');
      }
    } catch (e: any) {
      alert(e.message);
      console.error('Error generating PDF:', e);
    }
  }

  moreActions(event: Event, document: APPDocument): void {
    const items: MenuItem[] = [
      // View details action for all statuses
      {
        shape: 'rounded',
        tooltip: 'View details',
        icon: 'pi pi-eye',
        function: (event: Event, document: APPDocument) => {
          this.viewDocumentDetails(document);
        }
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.editDocument(document);
        }
      },
      {
        label: 'Export to PDF',
        icon: 'pi pi-file-pdf',
        command: () => {
          this.exportToPdf(document);
        }
      }
    ];
    
    // Create a dynamic menu
    const menu = document['querySelector']('p-menu');
    if (menu) {
      menu.model = items;
      menu.toggle(event);
    }
    
    // Prevent event propagation
    event.stopPropagation();
  }

  // Edit document
  editDocument(document: APPDocument): void {
    this.editingDocument = { ...document };
    this.isEditMode = true;
    this.showAPPModal = true;
  }
  viewDocumentDetails(document: APPDocument): void {
    // Navigate to the app-shared component with the document ID as a query parameter
    this.router.navigate(['/shared/app-shared'], {
      queryParams: {
        id: document.id,
        view: 'true'
      }
    });
  }
  
  deleteDocument(event: Event, document: APPDocument): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this Annual Procurement Plan?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete'
      },
      accept: async () => {
        this.progressTable.dataLoaded = false;
        
        // Here you would call your API to delete the document
        // For now, we'll simulate by removing from the array
        this.appDocuments = this.appDocuments.filter(doc => doc.id !== document.id);
        this.progressTable.data = [...this.appDocuments];
        
        this.progressTable.dataLoaded = true;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Deleted', 
          detail: 'Annual Procurement Plan has been deleted' 
        });
      }
    });
  }
  
  // Export to PDF
  exportToPdf(document: APPDocument): void {
    try {
      // Here you would implement PDF generation logic
      // For now, we'll simulate with the existing print method
      const blob = this.pdfService.generateDisbursementVoucher({
        voucherNo: document.id,
        supplierName: document.submittedBy,
        totalAmountDue: document.total_estimated_cost || 0,
        deliveryReceiptNo: document.app,
        status: 'pending',
        date: new Date(),
        paymentMethod: '',
        itemizedDetails: []
      });
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document['createElement']('a') as HTMLAnchorElement;
        link.href = url;
        link.download = `APP-${document.id}.pdf`;
        link.click();
        
        this.messageService.add({ 
          severity: 'info', 
          summary: 'Download Started', 
          detail: 'Your PDF is being downloaded' 
        });
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate PDF'
      });
    }
  }
  
  // Save edited document
  saveEditedDocument(): void {
    if (!this.editingDocument) {
      return;
    }
    
    this.progressTable.dataLoaded = false;
    
    // Here you would call your API to update the document
    // For now, we'll simulate by updating the array
    const index = this.appDocuments.findIndex(doc => doc.id === this.editingDocument!.id);
    if (index !== -1) {
      this.appDocuments[index] = { ...this.editingDocument };
      this.progressTable.data = [...this.appDocuments];
    }
    
    this.progressTable.dataLoaded = true;
    this.isEditMode = false;
    this.editingDocument = null;
    this.showAPPModal = false;
    
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Updated', 
      detail: 'Annual Procurement Plan has been updated' 
    });
  }

  progressTable: ProgressTableData<APPDocument, 'status'> = {
    title: 'Annual Procurement Plans',
    description: 'Track and manage annual procurement plans (APP) in this section.',
    columns: {
      // Include the requested columns matching your screenshot
      app: 'APP',
      documentName: 'Name of Document',
      type: 'Type',
      fiscal_year: 'Fiscal Year',
    },
    activeStep: 0,
    stepField: 'status',
    steps: [
      {
        id: 'DRAFT',
        label: 'Draft',
        icon: 'pi pi-file',
      },
      {
        id: 'FOR_REVIEW',
        label: 'For Review',
        icon: 'pi pi-sync',
      },
      {
        id: 'APPROVED',
        label: 'Approved',
        icon: 'pi pi-check-circle',
      },
    ],
    data: [],
    dataLoaded: false,
    topActions: [
      {
        label: 'Add Procurement Plan',
        icon: 'pi pi-plus',
        tooltip: 'Create a new procurement plan',
        function: () => {
          this.router.navigate(['/procurement/create-app']);
        }
      }
    ],
    rowActions: [
      // View details action for all statuses
      {
        shape: 'rounded',
        tooltip: 'View details',
        icon: 'pi pi-eye',
        function: (event: Event, document: APPDocument) => {
          this.router.navigate(['/procurement/app-details'], {
            queryParams: { id: document.id }
          });
        }
      },
      // Delete action (for all statuses)
      {
        shape: 'rounded',
        tooltip: 'Delete document',
        icon: 'pi pi-trash',
        color: 'danger',
        function: (event: Event, document: APPDocument) => this.deleteDocument(event, document)
      },
      // Submit for review (only for DRAFT status)
      {
        hidden: (document: APPDocument) => document.status !== 'DRAFT',
        shape: 'rounded',
        tooltip: 'Submit for review',
        icon: 'pi pi-send',
        color: 'success',
        function: (event: Event, document: APPDocument) => this.submitForReview(event, document)
      },
      // Approve action (only for FOR_REVIEW status)
      {
        hidden: (document: APPDocument) => document.status !== 'FOR_REVIEW',
        shape: 'rounded',
        tooltip: 'Approve document',
        icon: 'pi pi-check',
        color: 'success',
        function: (event: Event, document: APPDocument) => this.approveAPP(event, document)
      }
    ]
  };



  async fetchItems() {
    this.progressTable.dataLoaded = false;
    
    try {
      // Add a 1-second delay to ensure the skeleton is visible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.appDocuments = await this.appService.getAPPDocuments();
      this.progressTable.data = this.appDocuments;
    } catch (error) {
      console.error('Error fetching APP documents:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load procurement plans'
      });
    } finally {
      this.progressTable.dataLoaded = true;
    }
  }
}