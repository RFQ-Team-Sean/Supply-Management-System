import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LottieAnimationComponent } from "../../ui-components/lottie-animation/lottie-animation.component";

interface QuotationItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
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
  selector: 'app-resolution',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    LottieAnimationComponent
],
  templateUrl: './resolution.component.html',
  styleUrl: './resolution.component.scss',
  providers: [MessageService],
})
export class ResolutionComponent implements OnInit {
  searchQuery = '';
  displayDetailsDialog = false;
  displayResolutionDialog = false;
  selectedQuotation: PriceQuotation | null = null;
  resolutionRemarks = '';

  quotations: PriceQuotation[] = [];
  filteredQuotations: PriceQuotation[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    const storedQuotations = localStorage.getItem('quotations');
    if (storedQuotations) {
      this.quotations = JSON.parse(storedQuotations);
      this.filteredQuotations = this.quotations.filter((quote) => quote.status === 'Approved');
    }
  }

  filterQuotations() {
    this.filteredQuotations = this.quotations.filter(
      (quote) =>
        quote.status === 'Approved' &&
        Object.values(quote).some((value) =>
          value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
        )
    );
  }

  viewDetails(quote: PriceQuotation) {
    this.selectedQuotation = quote;
    this.displayDetailsDialog = true;
  }

  generateResolution(quote: PriceQuotation) {
    this.selectedQuotation = quote;
    this.displayResolutionDialog = true;
  }

  saveResolution() {
    if (this.selectedQuotation) {
      const resolution = {
        quotation: this.selectedQuotation,
        remarks: this.resolutionRemarks,
        date: new Date().toISOString(),
      };

      // Save resolution to localStorage
      const resolutions = JSON.parse(localStorage.getItem('resolutions') || '[]');
      resolutions.push(resolution);
      localStorage.setItem('resolutions', JSON.stringify(resolutions));

      this.messageService.add({
        severity: 'success',
        summary: 'Resolution Generated',
        detail: 'Resolution to award has been generated successfully.',
      });

      this.displayResolutionDialog = false;
      this.resolutionRemarks = '';
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