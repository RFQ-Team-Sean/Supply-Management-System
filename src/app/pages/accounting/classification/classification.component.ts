// classification.component.ts
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DeliveryReceipt, DeliveryReceiptService } from 'src/app/services/delivery-receipt.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import jsPDF from 'jspdf';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { LottieAnimationComponent } from "../../ui-components/lottie-animation/lottie-animation.component";
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DropdownModule } from 'primeng/dropdown';

interface JournalEntry {
  accountType: 'debit' | 'credit';
  accountCode: string;
  amount: number;
  classification: string;
}

enum ReceiptStatus {
  Unverified = 'unverified',  
  Processing = 'processing',
  Verified = 'verified'
}

@Component({
  selector: 'app-classification',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    ButtonModule,
    TableModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    LottieAnimationComponent,
    ToastModule,
    ConfirmPopupModule,
    DropdownModule,
    StepsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './classification.component.html',
})
export class ClassificationComponent implements OnInit {
  verifiedReceipts: DeliveryReceipt[] = [];
  searchValue: string = '';
  showReceiptDetailsModal: boolean = false;
  showSubmitFormModal: boolean = false;
  selectedReceipt?: DeliveryReceipt;
  steps: MenuItem[] = [];
  currentStep: number = 0;

  // Form-related properties
  accountTypes = [
    { label: 'Debit', value: 'debit' },
    { label: 'Credit', value: 'credit' },
  ];

  classifications = [
    { label: 'Supplies - Stock Card', value: 'supplies' },
    { label: 'Semi-Expendable - Property Card', value: 'semi_expendable' },
    { label: 'PPE - Property Card', value: 'ppe' }
  ];

  newEntry: JournalEntry = {
    accountType: 'debit',
    accountCode: '',
    amount: 0,
    classification: ''
  };
  entries: JournalEntry[] = [];

  constructor(
    private deliveryReceiptService: DeliveryReceiptService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    this.initializeSteps();
    try {
      this.verifiedReceipts = await this.deliveryReceiptService.getVerifiedReceipts();
      console.log('Loaded receipts:', this.verifiedReceipts); // Add this line
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load verified receipts.',
      });
    }
  }

  initializeSteps() {
    this.steps = [
      {
        label: 'Unverified',
        command: () => {
          this.currentStep = 0;
        }
      },
      {
        label: 'Verified',
        command: () => {
          this.currentStep = 1;
        }
      }
    ];
  }

  getFilteredReceipts() {
    // This ensures we only get receipts with the exact status we want
    const status = this.currentStep === 0 ? ReceiptStatus.Unverified : ReceiptStatus.Verified;
    return this.verifiedReceipts.filter(receipt => receipt.status === status);
}


  viewReceiptDetails(receipt: DeliveryReceipt) {
    this.selectedReceipt = receipt;
    this.showReceiptDetailsModal = true;
  }

  getClassificationLabel(value: string): string {
    const classification = this.classifications.find(c => c.value === value);
    return classification ? classification.label : '';
  }

  exportPdf(receipt: DeliveryReceipt) {
    const doc = new jsPDF();
    doc.text('Delivery Receipt', 10, 10);
    doc.text(`Receipt Number: ${receipt.receipt_number}`, 10, 20);
    doc.text(`Supplier Name: ${receipt.supplier_name}`, 10, 30);
    doc.text(`Delivery Date: ${receipt.delivery_date}`, 10, 40);
    doc.text(`Total Amount: PHP ${receipt.total_amount}`, 10, 50);
    doc.save(`Delivery_Receipt_${receipt.receipt_number}.pdf`);
  }

  openSubmitForm(receipt: DeliveryReceipt) {
    this.selectedReceipt = receipt;
    this.showSubmitFormModal = true;
    this.entries = [];
  }

  addEntry() {
    if (this.isEntryValid(this.newEntry)) {
      this.entries.push({ ...this.newEntry });
      this.resetNewEntry();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill out all fields correctly.',
      });
    }
  }

  removeEntry(entry: JournalEntry) {
    this.entries = this.entries.filter((e) => e !== entry);
  }

  isEntryValid(entry: JournalEntry): boolean {
    return (
      entry.accountType !== undefined && 
      entry.accountCode.trim() !== '' && 
      entry.amount > 0 &&
      entry.classification !== ''
    );
  }

  resetNewEntry() {
    this.newEntry = {
      accountType: 'debit',
      accountCode: '',
      amount: 0,
      classification: ''
    };
  }

  get totalDebits(): number {
    return this.entries
      .filter((e) => e.accountType === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalCredits(): number {
    return this.entries
      .filter((e) => e.accountType === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get isBalanced(): boolean {
    return this.totalDebits === this.totalCredits;
  }

  async submitJournalEntry() {
    try {
      if (this.selectedReceipt) {
        // Update the receipt status
        this.selectedReceipt.status = ReceiptStatus.Verified;
        
        // Update the receipt in the service
        await this.deliveryReceiptService.editReceipt(this.selectedReceipt);
  
        // Log the entry for debugging
        console.log('Submitting journal entry:', {
          receipt: this.selectedReceipt,
          entries: this.entries
        });
  
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Journal entry submitted successfully!',
        });
  
        // Refresh the receipts list after submission
        this.verifiedReceipts = await this.deliveryReceiptService.getVerifiedReceipts();
        
        this.showSubmitFormModal = false;
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit journal entry.',
      });
    }
  }
}