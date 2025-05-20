// general-ledger.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MaterialModule } from 'src/app/material.module';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AccountingService, LedgerAccount } from 'src/app/services/accounting.service';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { InputIcon } from 'primeng/inputicon';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-general-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    IconFieldModule,
    InputTextModule,
    TooltipModule,
    LottieAnimationComponent,
    InputIcon
  ],
  providers: [MessageService],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-content>
        <mat-card-title>General Ledger</mat-card-title>
        <mat-card-subtitle class="mat-body-1 mb-10 !flex justify-between items-center">
          <span>Review and manage ledger accounts and their transactions.</span>
          <div class="flex gap-3">
            <p-iconfield fluid class="w-full max-w-72">
              <p-inputicon styleClass="pi pi-search" />
              <input
                fluid
                class="w-full"
                pSize="small"
                [(ngModel)]="searchValue"
                (input)="dt.filterGlobal(searchValue, 'contains')"
                type="text"
                pInputText
                placeholder="Search"
              />
            </p-iconfield>
          </div>
        </mat-card-subtitle>

        <p-table
          #dt
          [value]="ledgerAccounts"
          [paginator]="true"
          [rows]="5"
          [rowsPerPageOptions]="[5, 10, 20]"
          [globalFilterFields]="['accountCode', 'accountName']"
          [tableStyle]="{ 'min-width': '50rem' }"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Debit Total</th>
              <th>Credit Total</th>
              <th>Balance</th>
              <th style="width: 5rem">Actions</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-account>
            <tr>
              <td>{{ account.accountCode }}</td>
              <td>{{ account.accountName }}</td>
              <td>{{ account.debitTotal | currency:'PHP' }}</td>
              <td>{{ account.creditTotal | currency:'PHP' }}</td>
              <td [ngClass]="{
                'text-green-600': account.balance > 0,
                'text-red-600': account.balance < 0
              }">
                {{ account.balance | currency:'PHP' }}
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    severity="info"
                    pTooltip="Export to PDF"
                    [outlined]="true"
                    size="small"
                    icon="pi pi-file-pdf"
                    rounded
                    (click)="exportToPDF(account)"
                  ></p-button>
                  <p-button
                    severity="secondary"
                    pTooltip="View Transactions"
                    [outlined]="true"
                    size="small"
                    icon="pi pi-list"
                    rounded
                    (click)="viewTransactions(account)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="footer">
            <tr>
              <td colspan="2" class="text-right font-bold">Totals:</td>
              <td class="font-bold">{{ getTotalDebits() | currency:'PHP' }}</td>
              <td class="font-bold">{{ getTotalCredits() | currency:'PHP' }}</td>
              <td class="font-bold">{{ getNetBalance() | currency:'PHP' }}</td>
              <td></td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6">
                <div class="flex flex-col w-full items-center justify-center mb-8">
                  <div class="overflow-hidden h-52 w-52 mr-8">
                    <app-lottie-animation animation="box" class="w-60 h-60"></app-lottie-animation>
                  </div>
                  <span>No ledger accounts found.</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </mat-card-content>
    </mat-card>

    <!-- Transactions Dialog -->
    <p-dialog 
      [(visible)]="showTransactionsDialog" 
      [modal]="true" 
      [style]="{width: '60vw'}"
      [header]="'Account Transactions - ' + (selectedAccount?.accountName || '')"
    >
      <div *ngIf="selectedAccount" class="p-4">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="font-bold">Account Code:</p>
            <p>{{ selectedAccount.accountCode }}</p>
          </div>
          <div>
            <p class="font-bold">Current Balance:</p>
            <p [ngClass]="{
              'text-green-600': selectedAccount.balance > 0,
              'text-red-600': selectedAccount.balance < 0
            }">
              {{ selectedAccount.balance | currency:'PHP' }}
            </p>
          </div>
        </div>

        <div class="mb-4">
          <p class="font-bold mb-2">Transaction History:</p>
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border p-2">Date</th>
                <th class="border p-2">Description</th>
                <th class="border p-2 text-right">Debit</th>
                <th class="border p-2 text-right">Credit</th>
                <th class="border p-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let trans of selectedAccount.transactions">
                <td class="border p-2">{{ trans.date | date:'mediumDate' }}</td>
                <td class="border p-2">{{ trans.description }}</td>
                <td class="border p-2 text-right">
                  {{ trans.debit > 0 ? (trans.debit | currency:'PHP') : '' }}
                </td>
                <td class="border p-2 text-right">
                  {{ trans.credit > 0 ? (trans.credit | currency:'PHP') : '' }}
                </td>
                <td class="border p-2 text-right" [ngClass]="{
                  'text-green-600': trans.balance > 0,
                  'text-red-600': trans.balance < 0
                }">
                  {{ trans.balance | currency:'PHP' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </p-dialog>

    <p-toast position="bottom-right" />
  `
})
export class GeneralLedgerComponent implements OnInit {
  ledgerAccounts: LedgerAccount[] = [];
  searchValue: string = '';
  showTransactionsDialog: boolean = false;
  selectedAccount?: LedgerAccount;

  constructor(
    private accountingService: AccountingService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.accountingService.getLedgerAccounts().subscribe({
      next: (accounts) => {
        this.ledgerAccounts = accounts;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ledger accounts'
        });
      }
    });
  }

  getTotalDebits(): number {
    return this.ledgerAccounts.reduce((sum, account) => 
      sum + account.debitTotal, 0);
  }

  getTotalCredits(): number {
    return this.ledgerAccounts.reduce((sum, account) => 
      sum + account.creditTotal, 0);
  }

  getNetBalance(): number {
    return this.ledgerAccounts.reduce((sum, account) => 
      sum + account.balance, 0);
  }

  viewTransactions(account: LedgerAccount) {
    this.selectedAccount = account;
    this.showTransactionsDialog = true;
  }

  exportToPDF(account: LedgerAccount) {
    const doc = new jsPDF();
  
    // Add Appendix 5 to the top-right corner
    doc.setFontSize(10); // Smaller font size
    doc.text('Appendix 5', doc.internal.pageSize.width - 20, 10, { align: 'right' });
  
    // Add GENERAL LEDGER title at the center and make it bold
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Make text bold
    const textWidth = doc.getTextWidth('GENERAL LEDGER');
    const centerX = (doc.internal.pageSize.width - textWidth) / 2; // Center horizontally
    doc.text('GENERAL LEDGER', centerX, 20);
  
    // Reset font to normal
    doc.setFont('helvetica', 'normal');
  
    // Add Entity Name, Fund Cluster, Account Title, and UACS Object Code
    doc.setFontSize(10);
  
    // Define positions for the fields
    const startX = 10; // Starting X position
    const startY = 30; // Starting Y position
    const lineHeight = 10; // Vertical spacing between lines
    const columnWidth = 90; // Width of each column
  
    // First row: Entity Name and Fund Cluster
    doc.text(`Entity Name: ${account.accountName}`, startX, startY);
    doc.text(`Fund Cluster: [Fund Cluster Value]`, startX + columnWidth, startY);
  
    // Second row: Account Title and UACS Object Code
    doc.text(`Account Title: ${account.accountName}`, startX, startY + lineHeight);
    doc.text(`UACS Object Code: [UACS Object Code Value]`, startX + columnWidth, startY + lineHeight);
  
    // Define the table headers and data
    const columns = ['Date', 'Particulars', 'Ref', 'Amount', 'Debit', 'Credit', 'Balance'];
  
    // Get the first 25 transactions (or fewer if there are not enough)
    const transactions = account.transactions.slice(0, 25);
  
    // Create rows for the table
    const rows = transactions.map(transaction => [
      transaction.date.toLocaleDateString(),
      transaction.description,
      '[Ref Value]', // Replace with actual reference if available
      '', // Empty value for Amount (merged across Debit, Credit, Balance)
      transaction.debit,
      transaction.credit,
      account.balance,
    ]);
  
    // Add empty rows if there are fewer than 25 transactions
    while (rows.length < 25) {
      rows.push(['', '', '', '', '', '', '']);
    }
  
    // Add a row for totals
    rows.push([
      '',
      '',
      'TOTALS',
      '', // Empty for Amount
      account.debitTotal,
      account.creditTotal,
      account.balance,
    ]);
  
    // Generate the table with black borders and no background color
    (doc as any).autoTable({
      startY: startY + 2 * lineHeight, // Start table immediately below the fields
      head: [
        ['Date', 'Particulars', 'Ref', { content: 'Amount', colSpan: 3, align: 'center' }],
        ['', '', '', 'Debit', 'Credit', 'Balance'], // Labels for Debit, Credit, and Balance under Amount
      ],
      body: rows,
      theme: 'plain', // Use plain theme for no background color
      styles: { 
        fontSize: 9,
        font: 'helvetica', // Use Helvetica font
        lineColor: [0, 0, 0], // Black border lines
        lineWidth: 0.1, // Thin border lines
        cellPadding: 1,
      },
      headStyles: {
        fillColor: false, 
        textColor: [0, 0, 0], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1, 
        halign: 'center', 
      },
      bodyStyles: {
        fillColor: false, 
        textColor: [0, 0, 0], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1, 
      },
      columnStyles: {
        0: { halign: 'center' }, 
        1: { halign: 'left' },   
        2: { halign: 'center' }, 
        3: { halign: 'center' }, 
        4: { halign: 'right' },  
        5: { halign: 'right' },  
        6: { halign: 'right' },  
      },
    });
  
    // Save the PDF
    doc.save(`${account.accountName}_general_ledger.pdf`);
}
}