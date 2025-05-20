import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';

interface QuotationItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number; // Added totalAmount
}

interface PriceQuotation {
  prNo: string;
  quotationNo: string;
  supplierName: string;
  items: QuotationItem[];
  total: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-price-quotation',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    InputNumberModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
  ],
  templateUrl: './price-quotation.component.html',
  styleUrl: './price-quotation.component.scss',
  providers: [MessageService],
})
export class PriceQuotationComponent implements OnInit {
  searchQuery = '';
  displayDialog = false;
  displayDetailsDialog = false;
  displayStatusDialog = false;
  selectedQuotation: PriceQuotation | null = null;

  quotations: PriceQuotation[] = [];
  filteredQuotations: PriceQuotation[] = [];

  newQuotation: PriceQuotation = {
    prNo: '',
    quotationNo: '',
    supplierName: '',
    items: [],
    total: 0,
    status: 'Pending',
  };

  purchaseRequests = [
    { label: 'PR-2024-001', value: 'PR-2024-001' },
    { label: 'PR-2024-002', value: 'PR-2024-002' },
    { label: 'PR-2024-003', value: 'PR-2024-003' },
  ];

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    const storedQuotations = localStorage.getItem('quotations');
    if (storedQuotations) {
      this.quotations = JSON.parse(storedQuotations);
      this.filteredQuotations = [...this.quotations];
    } else {
      // Initialize with default data
      this.quotations = [
        {
          prNo: 'PR-2024-001',
          quotationNo: 'QT-2024-001',
          supplierName: 'ABC Supplier',
          items: [
            { name: 'Item 1', quantity: 10, unitPrice: 100, totalAmount: 1000 },
            { name: 'Item 2', quantity: 5, unitPrice: 200, totalAmount: 1000 },
          ],
          total: 2000,
          status: 'Pending',
        },
      ];
      this.filteredQuotations = [...this.quotations];
      this.saveQuotations();
    }
  }

  saveQuotations() {
    localStorage.setItem('quotations', JSON.stringify(this.quotations));
  }

  filterQuotations() {
    this.filteredQuotations = this.quotations.filter((quote) =>
      Object.values(quote).some((value) =>
        value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  showDialog() {
    this.displayDialog = true;
    this.newQuotation = {
      prNo: '',
      quotationNo: `QT-${new Date().getFullYear()}-${String(this.quotations.length + 1).padStart(3, '0')}`,
      supplierName: '',
      items: [],
      total: 0,
      status: 'Pending',
    };
  }

  addItem() {
    this.newQuotation.items.push({ name: '', quantity: 0, unitPrice: 0, totalAmount: 0 });
  }

  removeItem(index: number) {
    this.newQuotation.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.newQuotation.items.forEach((item) => {
      item.totalAmount = item.quantity * item.unitPrice;
    });

    this.newQuotation.total = this.newQuotation.items.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
  }

  submitQuotation() {
    if (!this.newQuotation.prNo || !this.newQuotation.supplierName || this.newQuotation.items.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
      });
      return;
    }

    this.quotations.unshift({ ...this.newQuotation });
    this.filterQuotations();
    this.saveQuotations();

    this.messageService.add({
      severity: 'success',
      summary: 'Quotation Created',
      detail: 'Price Quotation has been created successfully.',
    });

    this.displayDialog = false;
  }

  viewDetails(quote: PriceQuotation) {
    this.selectedQuotation = quote;
    this.displayDetailsDialog = true;
  }

  changeStatus(quote: PriceQuotation) {
    this.selectedQuotation = quote;
    this.displayStatusDialog = true;
  }

  saveStatus() {
    if (this.selectedQuotation) {
      this.messageService.add({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Status updated to ${this.selectedQuotation.status}`,
      });
      this.saveQuotations();
      this.displayStatusDialog = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-300';
      case 'Approved':
        return 'bg-green-300';
      case 'Rejected':
        return 'bg-red-300';
      default:
        return 'bg-gray-500';
    }
  }
}