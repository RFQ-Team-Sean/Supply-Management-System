import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidcanvasViewquotationComponent } from './bidcanvas-viewquotation/bidcanvas-viewquotation.component';
import { BidcanvasPrintComponent } from './bidcanvas-print/bidcanvas-print.component';

interface BIDM {
  id: number;
  number: string;
  purchase_request_item: string;
  supplier_name: string;
  quotation_date: string;
  quotation_amount: string;
}

@Component({
  selector: 'app-bidmanagement-bidcanvas',
  standalone: true,
  imports: [CommonModule, BidcanvasViewquotationComponent, BidcanvasPrintComponent],
  templateUrl: './bidmanagement-bidcanvas.component.html',
  styleUrl: './bidmanagement-bidcanvas.component.css'
})
export class BidmanagementBidcanvasComponent implements OnInit {
  bidms: BIDM[] = [
    {
      id: 1,
      number: 'BID-001',
      purchase_request_item: 'Desktop Computers',
      supplier_name: 'ABC Computer Solutions',
      quotation_date: '2024-03-15',
      quotation_amount: '₱750,000.00'
    },
    {
      id: 2,
      number: 'BID-002',
      purchase_request_item: 'Office Chairs',
      supplier_name: 'Office Plus Supplies',
      quotation_date: '2024-03-14',
      quotation_amount: '₱250,000.00'
    },
    {
      id: 3,
      number: 'BID-003',
      purchase_request_item: 'Laboratory Equipment',
      supplier_name: 'Lab Equipment Co.',
      quotation_date: '2024-03-13',
      quotation_amount: '₱1,500,000.00'
    },
    {
      id: 4,
      number: 'BID-004',
      purchase_request_item: 'School Furniture',
      supplier_name: 'School Furniture Inc.',
      quotation_date: '2024-03-12',
      quotation_amount: '₱450,000.00'
    },
    {
      id: 5,
      number: 'BID-005',
      purchase_request_item: 'Sports Equipment',
      supplier_name: 'Sports Equipment Plus',
      quotation_date: '2024-03-11',
      quotation_amount: '₱350,000.00'
    }
  ];

  displayedBidms: BIDM[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  currentOpenActionId: number | null = null;
  showQuotationModal = false;
  selectedBidm: BIDM | null = null;
  showPrintModal = false;

  ngOnInit() {
    this.updateDisplayedBidms();
  }

  updateDisplayedBidms() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedBidms = this.bidms.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.bidms.length / this.itemsPerPage);
  }

  searchLogs(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.displayedBidms = this.bidms.filter(bidm => 
      bidm.supplier_name.toLowerCase().includes(searchTerm) ||
      bidm.number.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedBidms.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedBidms();
    }
  }

  toggleActions(bidm: BIDM) {
    this.currentOpenActionId = this.currentOpenActionId === bidm.id ? null : bidm.id;
  }

  viewQuotationBidm(bidm: BIDM) {
    this.selectedBidm = bidm;
    this.showQuotationModal = true;
    this.currentOpenActionId = null;
  }

  closeQuotationModal() {
    this.showQuotationModal = false;
    this.selectedBidm = null;
  }

  printBidm(bidm: BIDM) {
    this.selectedBidm = bidm;
    this.showPrintModal = true;
    this.currentOpenActionId = null;
  }

  closePrintModal() {
    this.showPrintModal = false;
    this.selectedBidm = null;
  }
}