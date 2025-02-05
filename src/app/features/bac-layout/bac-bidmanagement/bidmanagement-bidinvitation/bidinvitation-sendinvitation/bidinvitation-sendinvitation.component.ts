import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BIDM {
  id: number;
  number: string;
  supplier_name: string;
  send_date: string;
  status: 'Accept' | 'Reject' | 'Pending';
  invitation_status: string;
}

@Component({
  selector: 'app-bidinvitation-sendinvitation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidinvitation-sendinvitation.component.html',
  styleUrl: './bidinvitation-sendinvitation.component.css'
})
export class BidinvitationSendinvitationComponent {
  @Input() bidm: BIDM | null = null;
  @Output() closeModal = new EventEmitter<void>();

  bidders = [
    { id: 1, name: 'Bidder 1', selected: false },
    { id: 2, name: 'Bidder 2', selected: false },
    { id: 3, name: 'Bidder 3', selected: false },
    { id: 4, name: 'Bidder 4', selected: false },
    { id: 5, name: 'Bidder 5', selected: false },
    { id: 6, name: 'Bidder 6', selected: false }
  ];

  attachedFile = {
    name: 'bid_details.pdf',
    type: 'pdf'
  };

  get bidDetails(): string {
    return `${this.bidm?.number} - ${this.bidm?.supplier_name}`;
  }

  get purchaseRequest(): string {
    return 'IT supplies';
  }

  viewFile() {
    console.log('Viewing file:', this.attachedFile.name);
  }

  selectAll() {
    const allSelected = this.bidders.every(bidder => bidder.selected);
    this.bidders.forEach(bidder => bidder.selected = !allSelected);
  }

  resetBidders() {
    this.bidders.forEach(bidder => bidder.selected = false);
  }

  resetBidDetails() {
    // Reset logic if needed
  }

  resetPurchaseRequest() {
    // Reset logic if needed
  }

  cancel() {
    this.closeModal.emit();
  }

  confirm() {
    this.closeModal.emit();
  }
}
