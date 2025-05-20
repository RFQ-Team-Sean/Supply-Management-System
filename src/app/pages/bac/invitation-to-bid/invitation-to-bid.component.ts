import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface ITB {
  reference: string;
  projectName: string;
  category: string;
  procurementMode: string;
  abc: string;
  sourceOfFunds: string;
  deliveryLocation: string;
  eligibility: string;
  submissionDeadline: string;
  bidOpeningDate: string;
  bidSubmissionMethod: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  status: string;
}


@Component({
  selector: 'app-invitation-to-bid',
  standalone: true,
  imports: [
    TableModule,
    CardModule,
    CommonModule,
    ButtonModule,
    DialogModule,
    FieldsetModule,
    InputTextModule,
    FieldsetModule,
    ToastModule
  ],
  templateUrl: './invitation-to-bid.component.html',
  styleUrl: './invitation-to-bid.component.scss',
  providers: [MessageService]
})
export class InvitationToBidComponent {

  selectedITB: any = {};
  displayViewModal: boolean = false;
  displayDownloadModal: boolean = false;

  constructor(private messageService: MessageService) {}

  itbList: ITB[] = [
    {
      reference: '2024-001',
      projectName: 'Construction of Public Market',
      category: 'Infrastructure',
      procurementMode: 'Public Bidding',
      abc: '₱10,000,000.00',
      sourceOfFunds: 'General Appropriations Act (GAA)',
      deliveryLocation: 'Quezon City, Metro Manila',
      eligibility: 'Licensed Contractors with Government Accreditation',
      submissionDeadline: 'February 25, 2025, at 10:00 AM',
      bidOpeningDate: 'February 25, 2025, at 2:00 PM',
      bidSubmissionMethod: 'Physical Submission',
      contactPerson: 'Juan Dela Cruz',
      contactEmail: 'juan.delacruz@procurement.gov.ph',
      contactPhone: '+63 912 345 6789',
      officeAddress: 'Procurement Office, City Hall, Quezon City',
      status: 'Open'
    },
    {
      reference: '2024-002',
      projectName: 'Supply of Office Equipment',
      category: 'Goods',
      procurementMode: 'Public Bidding',
      abc: '₱2,500,000.00',
      sourceOfFunds: 'Corporate Funds',
      deliveryLocation: 'Makati City, Metro Manila',
      eligibility: 'Registered Suppliers with DTI & BIR Accreditation',
      submissionDeadline: 'March 10, 2025, at 10:00 AM',
      bidOpeningDate: 'March 10, 2025, at 2:00 PM',
      bidSubmissionMethod: 'Online Submission',
      contactPerson: 'Maria Santos',
      contactEmail: 'maria.santos@procurement.gov.ph',
      contactPhone: '+63 917 654 3210',
      officeAddress: 'Procurement Office, Makati City Hall',
      status: 'Closed'
    }
  ];

  viewDetails(itb: ITB) {
    this.selectedITB = itb;
    this.displayViewModal = true;
  }
 
  downloadFile(itb: ITB) {
    this.displayDownloadModal = true;
  }

  confirmDownload() {
    this.displayDownloadModal = false;
  }

  applyForBidding() {
    this.messageService.add({ severity: 'success', summary: 'Application Submitted', detail: 'Your bid application has been received!' });
  }

  sendInquiry() {
    this.messageService.add({ severity: 'info', summary: 'Inquiry Sent', detail: 'Your inquiry has been sent successfully!' });
  }
}
