import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bidder {
  id: number;
  name: string;
}

interface BIDM {
  id: number;
  number: string;
  requested_items: string[];
  bidders: number;
  start: string;
  end: string;
  status: string;
  date_created: string;
}

@Component({
  selector: 'app-bidmanagement-reviewbids',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidmanagement-reviewbids.component.html',
  styleUrl: './bidmanagement-reviewbids.component.css'
})
export class BidmanagementReviewbidsComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Input() selectedBid!: BIDM;
  
  // Add this property for the dummy file
  attachedFile = {
    name: 'bid_details.pdf',
    type: 'pdf'
  };

  // Add this method to handle view click
  viewFile() {
    // Implement file viewing logic here
    console.log('Viewing file:', this.attachedFile.name);
  }

  resetDates() {
    // Add reset functionality if needed
  }

  get dateFrom(): string {
    return this.formatDate(this.selectedBid?.start);
  }

  get dateTo(): string {
    return this.formatDate(this.selectedBid?.end);
  }

  get bidDetails(): string {
    return `Bid Number: ${this.selectedBid?.number}
Status: ${this.selectedBid?.status}
Date Created: ${this.formatDate(this.selectedBid?.date_created)}`;
  }

  get purchaseRequest(): string {
    return this.selectedBid?.requested_items.join(', ') || '';
  }
  
  get activeBidders(): Bidder[] {
    const bidderCount = this.selectedBid?.bidders || 0;
    return Array.from({ length: bidderCount }, (_, i) => ({
      id: i + 1,
      name: `Bidder ${i + 1}`
    }));
  }

  private formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  }

  confirm() {
    this.closeModal.emit();
  }
}
