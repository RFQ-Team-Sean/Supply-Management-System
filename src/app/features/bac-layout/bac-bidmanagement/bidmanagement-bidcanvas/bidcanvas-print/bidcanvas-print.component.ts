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
  selector: 'app-bidcanvas-print',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidcanvas-print.component.html',
  styleUrl: './bidcanvas-print.component.css'
})
export class BidcanvasPrintComponent {
  @Input() bidm: BIDM | null = null;
  @Output() closeModal = new EventEmitter<void>();

  attachedFile = {
    name: 'bid_details.pdf',
    type: 'pdf'
  };

  viewFile() {
    console.log('Viewing file:', this.attachedFile.name);
  }

  print() {
    console.log('Printing bid details for:', this.bidm);
    this.closeModal.emit();
  }
}
