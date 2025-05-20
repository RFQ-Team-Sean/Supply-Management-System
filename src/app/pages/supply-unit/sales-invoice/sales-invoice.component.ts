import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-invoice.component.html',
  styleUrls: ['./sales-invoice.component.scss']
})
export class SalesInvoiceComponent {
  @Output() invoiceSaved = new EventEmitter<void>();

  showInvoiceDialog(data: any, mode: 'create' | 'view' | 'edit' = 'edit') {
    // Implementation will go here
    console.log('Showing invoice dialog', { data, mode });
  }
}
