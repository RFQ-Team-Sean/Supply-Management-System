import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';
import { animate, style, transition, trigger } from '@angular/animations';

interface PurchaseRequest {
  id: number;
  department: string;
  amount: number;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  budgetCompliance: 'Within Budget' | 'Exceeds Budget';
  attachments: string[];
  history?: Array<{
    status: string;
    date: string;
    user: string;
    comment?: string;
  }>;
}

@Component({
  selector: 'app-validate-approved-request',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TimelineModule,
    CardModule,
    FileUploadModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './validate-approved-request.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class ValidateApprovedRequestComponent implements OnInit {
  purchaseRequests: PurchaseRequest[] = [];
  selectedRequest: PurchaseRequest | null = null;
  feedback: string = '';
  showDetailsDialog: boolean = false;
  loading: boolean = false;
  filters = {
    status: null,
    department: null
  };

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadPurchaseRequests();
  }

  loadPurchaseRequests() {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.purchaseRequests = [
        {
          id: 123,
          department: 'DeptA',
          amount: 10000,
          submissionDate: '2023-01-01',
          status: 'Pending',
          budgetCompliance: 'Within Budget',
          attachments: ['quote.pdf', 'specs.docx'],
          history: [
            { status: 'Submitted', date: '2023-01-01', user: 'John Doe' },
            { status: 'Under Review', date: '2023-01-02', user: 'Jane Smith' }
          ]
        },
        // Add more dummy data...
      ];
      this.loading = false;
    }, 1000);
  }

  onRowSelect(request: PurchaseRequest) {
    this.selectedRequest = request;
    this.showDetailsDialog = true;
  }

  approveRequest() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to approve this request?',
      accept: () => {
        if (this.selectedRequest) {
          this.selectedRequest.status = 'Approved';
          this.selectedRequest.history?.push({
            status: 'Approved',
            date: new Date().toISOString(),
            user: 'Current User',
            comment: 'Request approved'
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Approved',
            detail: `PR ${this.selectedRequest.id} has been approved`
          });
          this.logAction('Approved');
        }
      }
    });
  }

  rejectRequest() {
    if (!this.feedback) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please provide feedback for rejection'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to reject this request?',
      accept: () => {
        if (this.selectedRequest) {
          this.selectedRequest.status = 'Rejected';
          this.selectedRequest.history?.push({
            status: 'Rejected',
            date: new Date().toISOString(),
            user: 'Current User',
            comment: this.feedback
          });
          this.messageService.add({
            severity: 'info',
            summary: 'Rejected',
            detail: `PR ${this.selectedRequest.id} has been rejected`
          });
          this.notifyDepartment(this.selectedRequest.department, this.feedback);
          this.feedback = '';
        }
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'Pending':
        return 'warn';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'info';
    }
  }

  onUpload(event: any) {
    if (this.selectedRequest) {
      const files = event.files;
      // Handle file upload logic
      this.messageService.add({
        severity: 'success',
        summary: 'Upload Success',
        detail: `${files.length} files uploaded successfully`
      });
    }
  }

  private logAction(action: string) {
    console.log(`PR ${this.selectedRequest?.id} ${action}`);
  }

  private notifyDepartment(department: string, feedback: string) {
    console.log(`Notified ${department} with feedback: ${feedback}`);
  }
}