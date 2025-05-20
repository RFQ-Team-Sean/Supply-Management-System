import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { FileUploadModule } from 'primeng/fileupload';
import { MenuItem } from 'primeng/api';
import { DeliveryReceipt, DeliveryReceiptService } from 'src/app/services/delivery-receipt.service';

interface DocumentStatus {
  supplyLedger: boolean;
  jev: boolean;
  supportingDocs: boolean;
  generalJournal: boolean;
}

interface DocumentFiles {
  supplyLedger?: File;
  jev?: File;
  supportingDocs?: File;
  generalJournal?: File;
}

@Component({
  selector: 'app-final-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ButtonModule,
    TableModule,
    TabViewModule,
    DialogModule,
    ToastModule,
    StepsModule,
    FileUploadModule
  ],
  providers: [MessageService],
  templateUrl: './final-verification.component.html'
})
export class FinalVerificationComponent implements OnInit {
  receipts: DeliveryReceipt[] = [];
  selectedReceipt?: DeliveryReceipt;
  showDetailsModal: boolean = false;
  documentStatus: { [key: string]: DocumentStatus } = {};
  steps: MenuItem[] = [];
  currentStep: number = 0;
  loading: boolean = false;

  // Document upload related properties
  showUploadModal: boolean = false;
  currentDocumentType: string = '';
  selectedFile?: File;
  currentReceiptId?: string;
  documentFiles: { [key: string]: DocumentFiles } = {};

  activeTabIndex: number = 0;
  showPreviewModal: boolean = false;
  currentDocument: string = '';

  constructor(
    private deliveryReceiptService: DeliveryReceiptService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    this.initializeSteps();
    this.loading = true;
    try {
      this.receipts = await this.deliveryReceiptService.getVerifiedReceipts();
      
      // Load saved document status from localStorage
      const savedStatus = localStorage.getItem('documentStatus');
      if (savedStatus) {
        this.documentStatus = JSON.parse(savedStatus);
      }
      
      // Load saved document files info from localStorage
      const savedFiles = localStorage.getItem('documentFiles');
      if (savedFiles) {
        this.documentFiles = JSON.parse(savedFiles);
      }
      
      // Initialize missing status
      this.receipts.forEach(receipt => {
        if (!this.documentStatus[receipt.id!]) {
          this.documentStatus[receipt.id!] = {
            supplyLedger: false,
            jev: false,
            supportingDocs: false,
            generalJournal: false
          };
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load receipts'
      });
    } finally {
      this.loading = false;
    }
  }

  uploadDocument(receiptId: string, documentType: keyof DocumentStatus) {
    if (this.currentStep !== 0) return; // Only allow upload in the first step
    this.currentReceiptId = receiptId;
    this.currentDocumentType = documentType;
    this.showUploadModal = true;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.files[0];
  }

  async confirmUpload() {
    if (!this.selectedFile || !this.currentReceiptId || !this.currentDocumentType) {
      return;
    }

    try {
      // Initialize document files for this receipt if not exists
      if (!this.documentFiles[this.currentReceiptId]) {
        this.documentFiles[this.currentReceiptId] = {};
      }

      // Store the file
      this.documentFiles[this.currentReceiptId][this.currentDocumentType as keyof DocumentFiles] = this.selectedFile;

      // Update document status
      this.documentStatus[this.currentReceiptId][this.currentDocumentType as keyof DocumentStatus] = true;
      
      // Save to localStorage
      localStorage.setItem('documentStatus', JSON.stringify(this.documentStatus));
      localStorage.setItem('documentFiles', JSON.stringify(
        Object.fromEntries(
          Object.entries(this.documentFiles).map(([key, value]) => [
            key,
            Object.fromEntries(
              Object.entries(value).map(([docKey, file]) => [
                docKey,
                file.name // Store only filename for localStorage
              ])
            )
          ])
        )
      ));

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `${this.currentDocumentType} uploaded successfully`
      });

      this.closeUploadModal();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload document'
      });
    }
  }

  cancelUpload() {
    this.selectedFile = undefined;
    this.closeUploadModal();
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.currentDocumentType = '';
    this.selectedFile = undefined;
    this.currentReceiptId = undefined;
  }

  previewDocument(receiptId: string, type: string) {
    const file = this.documentFiles[receiptId]?.[type as keyof DocumentFiles];
    if (file) {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      // Clean up object URL
      URL.revokeObjectURL(url);
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'No File',
        detail: 'No document uploaded yet'
      });
    }
  }

  initializeSteps() {
    this.steps = [
      {
        label: 'Pending Approval',
        command: () => {
          this.currentStep = 0;
        }
      },
      {
        label: 'Approved',
        command: () => {
          this.currentStep = 1;
        }
      },
      {
        label: 'Completed',
        command: () => {
          this.currentStep = 2;
        }
      }
    ];
  }

  getFilteredReceipts() {
    return this.receipts.filter(receipt => {
      const isApproved = this.isReceiptFullyVerified(receipt.id!);
      if (this.currentStep === 0) {
        return !isApproved; // Pending Approval
      } else if (this.currentStep === 1) {
        return isApproved; // Approved
      } else if (this.currentStep === 2) {
        return receipt.status === 'completed'; // Completed
      }
      return false;
    });
  }

  openDetails(receipt: DeliveryReceipt) {
    this.selectedReceipt = receipt;
    this.showDetailsModal = true;
  }

  toggleDocumentStatus(receiptId: string, docType: keyof DocumentStatus) {
    this.documentStatus[receiptId][docType] = !this.documentStatus[receiptId][docType];
    // Save status to localStorage
    localStorage.setItem('documentStatus', JSON.stringify(this.documentStatus));
  }

  isReceiptFullyVerified(receiptId: string): boolean {
    const status = this.documentStatus[receiptId];
    return status.supplyLedger && status.jev && status.supportingDocs && status.generalJournal;
  }

  async confirmEntry(receipt: DeliveryReceipt) {
    try {
      await this.deliveryReceiptService.editReceipt({
        ...receipt,
        status: 'completed' // Update status to 'completed'
      });
  
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Receipt has been confirmed and marked as completed'
      });
  
      this.receipts = await this.deliveryReceiptService.getVerifiedReceipts();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to confirm receipt'
      });
    }
  }

  async finalizeVerification(receipt: DeliveryReceipt) {
    try {
      await this.deliveryReceiptService.editReceipt({
        ...receipt,
        status: 'verified'
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Receipt has been finalized'
      });

      this.receipts = await this.deliveryReceiptService.getVerifiedReceipts();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to finalize verification'
      });
    }
  }
}