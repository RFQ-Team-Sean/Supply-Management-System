// general-journal.component.ts
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
import { AccountingService, GeneralJournalEntry } from 'src/app/services/accounting.service';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { InputIcon } from 'primeng/inputicon';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-general-journal',
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
        <mat-card-title>General Journal</mat-card-title>
        <mat-card-subtitle class="mat-body-1 mb-10 !flex justify-between items-center">
          <span>Review and manage journal entries.</span>
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
          [value]="journalEntries"
          [paginator]="true"
          [rows]="5"
          [rowsPerPageOptions]="[5, 10, 20]"
          [globalFilterFields]="['entryNo', 'description']"
          [tableStyle]="{ 'min-width': '50rem' }"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Entry No</th>
              <th>Date</th>
              <th>Description</th>
              <th>Account</th>
              <th>Debit</th>
              <th>Credit</th>
              <th style="width: 5rem">Actions</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-entry>
            <tr>
              <td>{{ entry.entryNo }}</td>
              <td>{{ entry.date | date }}</td>
              <td>{{ entry.description }}</td>
              <td>
                <div *ngFor="let trans of entry.transactions" class="py-1">
                  {{ trans.accountName }}
                </div>
              </td>
              <td>
                <div *ngFor="let trans of entry.transactions" class="py-1">
                  {{ trans.debit > 0 ? (trans.debit | currency:'PHP') : '' }}
                </div>
              </td>
              <td>
                <div *ngFor="let trans of entry.transactions" class="py-1">
                  {{ trans.credit > 0 ? (trans.credit | currency:'PHP') : '' }}
                </div>
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
                    (click)="exportToPDF(entry)"
                  ></p-button>
                  <p-button
                    severity="secondary"
                    pTooltip="View Details"
                    [outlined]="true"
                    size="small"
                    icon="pi pi-eye"
                    rounded
                    (click)="viewDetails(entry)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="footer">
            <tr>
              <td colspan="4" class="text-right font-bold">Totals:</td>
              <td class="font-bold">{{ getTotalDebits() | currency:'PHP' }}</td>
              <td class="font-bold">{{ getTotalCredits() | currency:'PHP' }}</td>
              <td></td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7">
                <div class="flex flex-col w-full items-center justify-center mb-8">
                  <div class="overflow-hidden h-52 w-52 mr-8">
                    <app-lottie-animation animation="box" class="w-60 h-60"></app-lottie-animation>
                  </div>
                  <span>No journal entries found.</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </mat-card-content>
    </mat-card>

    <!-- Details Dialog -->
    <p-dialog 
      [(visible)]="showDetailsDialog" 
      [modal]="true" 
      [style]="{width: '50vw'}"
      [header]="'Journal Entry Details - ' + (selectedEntry?.entryNo || '')"
    >
      <div *ngIf="selectedEntry" class="p-4">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="font-bold">Entry Number:</p>
            <p>{{ selectedEntry.entryNo }}</p>
          </div>
          <div>
            <p class="font-bold">Date:</p>
            <p>{{ selectedEntry.date | date:'mediumDate' }}</p>
          </div>
        </div>
        
        <div class="mb-4">
          <p class="font-bold">Description:</p>
          <p>{{ selectedEntry.description }}</p>
        </div>

        <div class="mb-4">
          <p class="font-bold mb-2">Transactions:</p>
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border p-2 text-left">Account</th>
                <th class="border p-2 text-right">Debit</th>
                <th class="border p-2 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let trans of selectedEntry.transactions">
                <td class="border p-2">{{ trans.accountName }}</td>
                <td class="border p-2 text-right">
                  {{ trans.debit > 0 ? (trans.debit | currency:'PHP') : '' }}
                </td>
                <td class="border p-2 text-right">
                  {{ trans.credit > 0 ? (trans.credit | currency:'PHP') : '' }}
                </td>
              </tr>
              <tr class="bg-gray-50">
                <td class="border p-2 font-bold">Totals</td>
                <td class="border p-2 text-right font-bold">
                  {{ selectedEntry.debitTotal | currency:'PHP' }}
                </td>
                <td class="border p-2 text-right font-bold">
                  {{ selectedEntry.creditTotal | currency:'PHP' }}
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
export class GeneralJournalComponent implements OnInit {
  journalEntries: GeneralJournalEntry[] = [];
  searchValue: string = '';
  showDetailsDialog: boolean = false;
  selectedEntry?: GeneralJournalEntry;

  constructor(
    private accountingService: AccountingService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.accountingService.getJournalEntries().subscribe(entries => {
      this.journalEntries = entries;
    });
  }

  getTotalDebits(): number {
    return this.journalEntries.reduce((sum, entry) => 
      sum + entry.debitTotal, 0);
  }

  getTotalCredits(): number {
    return this.journalEntries.reduce((sum, entry) => 
      sum + entry.creditTotal, 0);
  }

  viewDetails(entry: GeneralJournalEntry) {
    this.selectedEntry = entry;
    this.showDetailsDialog = true;
  }

  exportToPDF(entry: GeneralJournalEntry) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(10);
    doc.text('Appendix 1', doc.internal.pageSize.width - 20, 10, { align: 'right' });

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const ledgerText = 'GENERAL JOURNAL';
    const ledgerWidth = doc.getTextWidth(ledgerText);
    const ledgerCenterX = (doc.internal.pageSize.width - ledgerWidth) / 2;
    doc.text(ledgerText, ledgerCenterX, 20);

    // Month Placeholder
    doc.setFontSize(10);
    const monthText = 'Month: ___________________';
    const monthWidth = doc.getTextWidth(monthText);
    const monthCenterX = (doc.internal.pageSize.width - monthWidth) / 2;
    doc.text(monthText, monthCenterX, 30);

    // Entity Information
    doc.text('Entity Name: _________________________', 10, 40);
    doc.text('Fund Cluster: _________________________', 10, 50);
    doc.text('Sheet No.: _________________________', doc.internal.pageSize.width - 100, 50);

    // Table Headers
    const columns = ['Date', 'JEV No.', 'Particulars', 'UACS Objects Code', 'P', { content: 'Amount', colSpan: 2 }];
    const subColumns = ['', '', '', '', '', 'Debit', 'Credit'];

    // Table Body
    const rows = entry.transactions.map(transaction => [
        entry.date.toLocaleDateString(),
        entry.entryNo,
        entry.description,
        transaction.accountCode,
        '',
        transaction.debit,
        transaction.credit,
    ]);

    // Fill empty rows to maintain table height
    while (rows.length < 20) {
        rows.push(['', '', '', '', '', '', '']);
    }

    // Add Totals Row
    rows.push([
        '',
        '',
        '',
        'Totals',
        '',
        entry.debitTotal.toFixed(2),
        entry.creditTotal.toFixed(2),
    ]);

    // Table Options
    const tableOptions = {
        startY: 60,
        head: [columns, subColumns],
        body: rows,
        theme: 'plain',
        styles: {
            fontSize: 9,
            font: 'helvetica',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
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
            5: { halign: 'center' },
            6: { halign: 'center' },
        },
    };

    // Add Table
    (doc as any).autoTable(tableOptions);
    const finalY = (doc as any).lastAutoTable.finalY;

    // Certification Text
    doc.setFontSize(10);
    const certifiedText = 'CERTIFIED CORRECT:';
    const certifiedWidth = doc.getTextWidth(certifiedText);
    const certifiedCenterX = (doc.internal.pageSize.width - certifiedWidth) / 2;
    doc.text(certifiedText, certifiedCenterX, finalY + 5);

    // Signature Line
    const signatureY = doc.internal.pageSize.height - 25;
    const lineStartX = doc.internal.pageSize.width - 100;
    const lineEndX = doc.internal.pageSize.width - 20;
    const lineY = signatureY - 5;
    doc.line(lineStartX, lineY, lineEndX, lineY);

    // Signature Text
    const signatureText = '(Signature over Printed Name)';
    const signatureWidth = doc.getTextWidth(signatureText);
    const signatureCenterX = (lineStartX + lineEndX - signatureWidth) / 2;
    doc.text(signatureText, signatureCenterX, signatureY);

    // Chief Accountant Text
    const chiefAccountantText = 'Chief Accountant/Head of\nAccounting Division/Unit';
    const chiefAccountantWidth = doc.getTextWidth(chiefAccountantText.split('\n')[0]);
    const chiefAccountantCenterX = (lineStartX + lineEndX - chiefAccountantWidth) / 2;
    doc.text(chiefAccountantText, chiefAccountantCenterX, signatureY + 5);

    // Save PDF
    doc.save(`${entry.entryNo}_general_ledger.pdf`);
}
}