import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bidder {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-bidmanagement-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidmanagement-create.component.html',
  styleUrl: './bidmanagement-create.component.css'
})
export class BidmanagementCreateComponent {
  @Output() closeModal = new EventEmitter<void>();

  bidders: Bidder[] = [
    { id: 1, name: 'Bidder 1', selected: false },
    { id: 2, name: 'Bidder 2', selected: false },
    { id: 3, name: 'Bidder 3', selected: false },
    { id: 4, name: 'Bidder 4', selected: false },
    { id: 5, name: 'Bidder 5', selected: false },
    { id: 6, name: 'Bidder 6', selected: false },
  ];

  dateFrom: string = '';
  dateTo: string = '';
  bidDetails: string = '';
  purchaseRequest: string = '';
  bidFileName: string = '';
  @ViewChild('bidFileInput') bidFileInput!: ElementRef;

  resetDates() {
    this.dateFrom = '';
    this.dateTo = '';
  }

  resetBidDetails() {
    this.bidDetails = '';
  }

  resetPurchaseRequest() {
    this.purchaseRequest = '';
  }

  resetBidders() {
    this.bidders.forEach(bidder => bidder.selected = false);
  }

  selectAll() {
    const allSelected = this.bidders.every(bidder => bidder.selected);
    this.bidders.forEach(bidder => bidder.selected = !allSelected);
  }

  reset() {
    this.resetDates();
    this.resetBidDetails();
    this.resetPurchaseRequest();
    this.resetBidders();
  }

  apply() {
    // Implement your apply logic here
    this.closeModal.emit();
  }

  onBidFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.bidFileName = file.name;
    }
  }
}
