import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MaterialModule } from 'src/app/material.module';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { FluidModule } from 'primeng/fluid';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DisbursementVoucherService, DisbursementVoucher, ExtendedDisbursementVoucher } from 'src/app/services/disbursement-voucher.service';
import { DeliveryReceiptService, DeliveryReceipt } from 'src/app/services/delivery-receipt.service';
import { AccountingService } from 'src/app/services/accounting.service';

interface DetailedJournalEntry extends DisbursementVoucher {
  debitEntries: { accountCode: string; accountName: string; amount: number }[];
  creditEntries: { accountCode: string; accountName: string; amount: number }[];
  deliveryReceipt?: DeliveryReceipt;
}

@Component({
  selector: 'app-journal-entry-voucher',
  standalone: true,
  imports: [
    ConfirmPopupModule,
    FormsModule,
    MaterialModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputText,
    InputIcon,
    IconFieldModule,
    ToastModule,
    FluidModule,
    TooltipModule,
    DialogModule,
    InputTextModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './journal-entry-voucher.component.html',
  styleUrl: './journal-entry-voucher.component.scss',
})
export class JournalEntryVoucherComponent {
  journalEntries: DetailedJournalEntry[] = [];
  searchValue: string = '';
  showEntryDetailsModal: boolean = false;
  showDetailedInfoModal: boolean = false;
  selectedEntry?: DetailedJournalEntry;

  constructor(
    private disbursementVoucherService: DisbursementVoucherService,
    private deliveryReceiptService: DeliveryReceiptService,
    private messageService: MessageService,
    public accountingService: AccountingService 
  ) {}

  ngOnInit(): void {
    this.fetchJournalEntries();
  }

  
  async fetchJournalEntries() {
    try {
      const allVouchers = await this.disbursementVoucherService.getAll();
      const allReceipts = await this.deliveryReceiptService.getAll();
      
      this.journalEntries = allVouchers
        .filter(voucher => voucher.status === 'recorded')
        .map(voucher => ({
          ...voucher,
          debitEntries: [
            { accountCode: '101', accountName: 'Cash in Bank', amount: voucher.totalAmountDue },
          ],
          creditEntries: [
            { accountCode: '201', accountName: 'Accounts Payable', amount: voucher.totalAmountDue },
          ],
          deliveryReceipt: allReceipts.find(receipt => receipt.receipt_number === voucher.deliveryReceiptNo)
        }));
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch journal entries'
      });
    }
  }

  viewEntryDetails(entry: DetailedJournalEntry) {
    this.selectedEntry = entry;
    this.showEntryDetailsModal = true;
  }

  viewDetailedInfo(entry: DetailedJournalEntry) {
    this.selectedEntry = entry;
    this.showDetailedInfoModal = true;
  }

  exportPdf(entry: DetailedJournalEntry) {
    const doc = new jsPDF();
  
    // Set page margins
    const margin = 20; 
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header Section
    doc.setFontSize(16).setFont('helvetica', 'bold');
    doc.text('QUANBY SOLUTIONS INC', pageWidth / 2, margin - 5, { align: 'center' });
    doc.setFontSize(8).setFont('helvetica', 'normal');
    doc.text('4th Flr. Dosc Bldg., Brgy. 37-Bitano, Legazpi City, Albay', pageWidth / 2, margin + 0, { align: 'center' });
    doc.text('VAT Reg. TIN: 625-263-719-00000', pageWidth / 2, margin + 5, { align: 'center' });
  
    // Horizontal Line below Header
    doc.setDrawColor(200, 200, 200); 
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
  
    // Title Section
    doc.setFontSize(18).setFont('helvetica', 'bold');
    doc.text('Journal Entry Voucher', pageWidth / 2, margin + 25, { align: 'center' });
  
    // Voucher Details Section
    doc.setFontSize(10);
    const detailsStartY = margin + 35;
    doc.setFont('helvetica', 'bold');
    doc.text('Voucher Number:', margin, detailsStartY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${entry.voucherNo}`, margin + 50, detailsStartY);
  
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin, detailsStartY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date(entry.date).toLocaleDateString()}`, margin + 50, detailsStartY + 7);
  
    // Add Supplier Name
    doc.setFont('helvetica', 'bold');
    doc.text('Supplier Name:', margin, detailsStartY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(entry.supplierName, margin + 50, detailsStartY + 14);
  
    // Debit and Credit Table
    const tableData = [
      ['Account Code', 'Account Name', 'Debit (Dr)', 'Credit (Cr)'],
      ...entry.debitEntries.map(e => [e.accountCode, e.accountName, e.amount.toFixed(2), '']),
      ...entry.creditEntries.map(e => [e.accountCode, e.accountName, '', e.amount.toFixed(2)]),
    ];
  
    (doc as any).autoTable({
      startY: detailsStartY + 25,
      head: [tableData.shift()],
      body: tableData,
      theme: 'plain', // Use plain theme for no background color
      styles: { 
        fontSize: 9,
        font: 'helvetica',
        lineColor: [0, 0, 0], // Black border lines
        lineWidth: 0.1,
        cellPadding: 1,
      },
      headStyles: {
        fillColor: false, // No fill color
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        halign: 'center',
      },
      bodyStyles: {
        fillColor: false, // No fill color
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { halign: 'center' }, 
        1: { halign: 'left' },   
        2: { halign: 'right' },  
        3: { halign: 'right' },  
      },
    });
  
    // Add Total Amount to the Bottom Right of the Table
    const totalAmount = entry.totalAmountDue.toFixed(2);
    const tableEndY = (doc as any).autoTable.previous.finalY + 10;
  
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('Total Amount:', pageWidth - margin - 60, tableEndY);  
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text(`PHP ${totalAmount}`, pageWidth - margin - 30, tableEndY);
  
    // Footer Section
    const finalY = tableEndY + 15;
    const sectionHeight = 16;
  
    doc.setFontSize(9);
    doc.text('Prepared By:', margin, finalY);
    doc.text('Name: _____________', margin, finalY + 8); 
    doc.text('Date:  ______________', margin, finalY + 16); 
  
    doc.text('Checked By:', pageWidth / 3, finalY);
    doc.text('Name: _____________', pageWidth / 3, finalY + 8); 
    doc.text('Date:  ______________', pageWidth / 3, finalY + 16); 
  
    doc.text('Approved By:', (pageWidth * 2) / 3, finalY);
    doc.text('Name: _____________', (pageWidth * 2) / 3, finalY + 8); 
    doc.text('Date:  ______________', (pageWidth * 2) / 3, finalY + 16); 
  
    // Save the PDF
    doc.save(`Journal_Entry_Voucher_${entry.voucherNo}.pdf`);
}

generateAccountingEntries(voucher: DetailedJournalEntry) {
  try {
    // Check if already processed
    if (this.accountingService.isVoucherProcessed(voucher.voucherNo)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'This voucher has already been processed'
      });
      return;
    }

    const journalVoucher = {
      voucherNo: voucher.voucherNo,
      totalAmountDue: voucher.totalAmountDue,
      debitEntries: voucher.debitEntries.map(entry => ({
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        amount: entry.amount
      })),
      creditEntries: voucher.creditEntries.map(entry => ({
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        amount: entry.amount
      }))
    };
    
    this.accountingService.generateAccountingEntries(journalVoucher);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Journal and ledger entries generated successfully'
    });
  } catch (error) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate entries: ' + (error as Error).message
    });
  }
}
}