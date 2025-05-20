import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface OrsRequest {
  orsNumber: string;
  date: Date;
  endUserUnit: string;
  description: string;
  amountObligated: number;
  status: string;
}

@Component({
  selector: 'app-ors',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './ors.component.html',
  styleUrl: './ors.component.scss'
})
export class OrsComponent {
  orsRequests: OrsRequest[] = [
    {
      orsNumber: 'ORS-2025-001',
      date: new Date('2025-02-01'),
      endUserUnit: 'Procurement Office',
      description: 'Office Supplies Delivery',
      amountObligated: 50000,
      status: 'Pending'
    },
    {
      orsNumber: 'ORS-2025-002',
      date: new Date('2025-02-10'),
      endUserUnit: 'IT Department',
      description: 'Server Maintenance',
      amountObligated: 120000,
      status: 'Pending'
    },
    {
      orsNumber: 'ORS-2025-003',
      date: new Date('2025-02-15'),
      endUserUnit: 'Finance Division',
      description: 'Audit Services',
      amountObligated: 75000,
      status: 'Pending'
    }
  ];

  filteredRequests: OrsRequest[] = [...this.orsRequests];
  searchTerm: string = ''; // Not strictly needed with #searchInput, but kept for potential future use

  constructor(private messageService: MessageService) {
    console.log('MessageService initialized:', this.messageService);
  }

  certifyRequest(request: OrsRequest) {
    request.status = 'Certified';
    console.log('Certifying:', request.orsNumber);
    this.messageService.add({
      key: 'orsToast',
      severity: 'success',
      summary: 'Fund Availability Certified',
      detail: `ORS ${request.orsNumber} has been certified.`,
      life: 3000 // Added life for consistency
    });
    this.filterRequests(''); // Reset filter or adjust based on current input if needed
  }

  rejectRequest(request: OrsRequest) {
    request.status = 'Rejected';
    console.log('Rejecting:', request.orsNumber);
    this.messageService.add({
      key: 'orsToast',
      severity: 'error',
      summary: 'Rejected',
      detail: `ORS ${request.orsNumber} has been rejected.`,
      life: 3000 // Added life for consistency
    });
    this.filterRequests(''); // Reset filter or adjust based on current input if needed
  }

  filterRequests(searchTerm: string = '') { // Accept parameter from input
    if (!searchTerm.trim()) {
      this.filteredRequests = [...this.orsRequests];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredRequests = this.orsRequests.filter(request =>
        request.orsNumber.toLowerCase().includes(term) ||
        request.endUserUnit.toLowerCase().includes(term) ||
        request.description.toLowerCase().includes(term) ||
        request.status.toLowerCase().includes(term)
      );
    }
  }
}