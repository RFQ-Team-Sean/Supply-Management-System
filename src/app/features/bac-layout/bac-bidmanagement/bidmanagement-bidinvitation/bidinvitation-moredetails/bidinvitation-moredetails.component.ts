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
  selector: 'app-bidinvitation-moredetails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidinvitation-moredetails.component.html',
  styleUrl: './bidinvitation-moredetails.component.css'
})
export class BidinvitationMoredetailsComponent {
  @Input() bidm: BIDM | null = null;
  @Output() closeModal = new EventEmitter<void>();

  attachedFile = {
    name: 'bid_details.pdf',
    type: 'pdf'
  };

  // Get formatted date from the input bidm
  get dateFrom(): string {
    return this.formatDate(this.bidm?.send_date || '');
  }

  get dateTo(): string {
    return this.formatDate(this.bidm?.send_date || '');
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  viewFile() {
    console.log('Viewing file:', this.attachedFile.name);
  }

  resetDates() {
    // Reset logic if needed
  }

  confirm() {
    this.closeModal.emit();
  }
}
