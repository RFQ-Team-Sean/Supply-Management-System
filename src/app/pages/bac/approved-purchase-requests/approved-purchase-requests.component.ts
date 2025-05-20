import { Component, OnInit } from '@angular/core';
import { RequisitionService, Requisition } from 'src/app/services/requisition.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { PurchaseReqComponent } from '../../shared/purchase-req/purchase-req.component';

@Component({
  selector: 'app-approved-purchase-requests',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, ProgressSpinnerModule, TimelineModule, CardModule, MatCardModule, PurchaseReqComponent],
  templateUrl: './approved-purchase-requests.component.html',
  styleUrls: ['./approved-purchase-requests.component.scss']
})
export class ApprovedPurchaseRequestsComponent implements OnInit {
  requisitions: Requisition[] = []; // Array to store requisitions
  loading: boolean = true; // Loading state
  displayModal: boolean = false; // Modal visibility state for attachments and history
  displayAttachmentModal: boolean = false; // Modal visibility state for attachment preview
  selectedRequisition: Requisition | null = null; // Selected requisition for modal
  selectedAttachmentUrl: SafeResourceUrl | null = null; // URL of the selected attachment

  constructor(
    private requisitionService: RequisitionService,
    private router: Router,
    private sanitizer: DomSanitizer // For sanitizing URLs
  ) {}

  ngOnInit(): void {
    this.loadRequisitions();
  }

  // Fetch requisitions with currentApprovalLevel = 4
  async loadRequisitions(): Promise<void> {
    try {
      const allRequisitions = await this.requisitionService.getAllRequisitions();
      this.requisitions = allRequisitions.filter(req => req.currentApprovalLevel === 4);
    } catch (error) {
      console.error('Failed to load requisitions:', error);
    } finally {
      this.loading = false; // Set loading to false after fetching data
    }
  }

 
  showAttachments(requisition: Requisition): void {
  this.selectedRequisition = {
    ...requisition,
    approvalHistory: requisition.approvalHistory?.map(history => ({
      ...history,
      approversName: history.approversName || 'Unknown', // Default name if not provided
      signature: history.signature || undefined // Set undefined if signature is null
    })) || [] // Ensure approvalHistory is always an array
  };
  this.displayModal = true;
}

  
  // Open the attachment preview modal
  viewAttachment(attachmentUrl: string): void {
    this.selectedAttachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(attachmentUrl);
    this.displayAttachmentModal = true;
  }

  displayPurchaseRequestModal: boolean = false;
selectedRequisitionId: string | null = null;

viewPurchaseRequest(requisitionId: string): void {
  this.selectedRequisitionId = requisitionId;
  this.displayPurchaseRequestModal = true;
}

}