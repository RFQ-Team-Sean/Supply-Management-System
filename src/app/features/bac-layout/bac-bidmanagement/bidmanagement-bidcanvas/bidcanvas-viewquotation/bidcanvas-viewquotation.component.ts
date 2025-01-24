import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BIDM {
  id: number;
  number: string;
  purchase_request_item: string;
  supplier_name: string;
  quotation_date: string;
  quotation_amount: string;
}

@Component({
  selector: 'app-bidcanvas-viewquotation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidcanvas-viewquotation.component.html',
  styleUrl: './bidcanvas-viewquotation.component.css'
})
export class BidcanvasViewquotationComponent {
  @Input() bidm: BIDM | null = null;
  @Output() closeModal = new EventEmitter<void>();

  attachedFile = {
    name: 'bid_details.pdf',
    type: 'pdf'
  };

  activeBidders = [
    { name: 'Bidder 1', file: 'bid_quotation.pdf' },
    { name: 'Bidder 2', file: 'bid_quotation.pdf' },
    { name: 'Bidder 3', file: 'bid_quotation.pdf' }
  ];

  viewFile(fileName: string) {
    console.log('Viewing file:', fileName);
  }

  confirm() {
    this.closeModal.emit();
  }
}
