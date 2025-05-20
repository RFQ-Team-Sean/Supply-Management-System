import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RequisitionService } from 'src/app/services/requisition.service';
import { UserService } from 'src/app/services/user.service';
import { Requisition } from 'src/app/services/requisition.service';

@Component({
  selector: 'app-issue-slip',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './issue-slip.component.html',
  styleUrl: './issue-slip.component.scss'
})
export class IssueSlipComponent implements OnInit {
  requisitions: Requisition[] = []; // List of requisitions with issue slips
  selectedRequisition: Requisition | null = null; // Selected requisition for preview
  displayPreviewDialog = false; // Controls visibility of the preview dialog
  pdfPreviewUrl: SafeResourceUrl | null = null; // URL for the PDF preview
  loading = false; // Loading state
  isAccountingUser = false; // Role check for accounting users

  constructor(
    private requisitionService: RequisitionService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    await this.loadRequisitions(); // Load requisitions on component initialization
    this.checkUserRole(); // Check if the user is an accounting user
  }

  // Check if the current user is an accounting user
  private checkUserRole() {
    const currentUser = this.userService.getUser();
    this.isAccountingUser = currentUser?.role === 'accounting';
  }

  // Load requisitions with issue slips
  private async loadRequisitions() {
    try {
      this.loading = true;
      const allRequisitions = await this.requisitionService.getAllRequisitions();
      // Filter requisitions that have issue slips
      this.requisitions = allRequisitions.filter(req => 
        req.issueSlipId && 
        req.issuedStocks && 
        req.issuedStocks.length > 0
      );
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  // View issue slip (PDF preview)
  viewIssueSlip(requisition: Requisition) {
    this.selectedRequisition = requisition;
    const pdfUrl = this.generateIssuePdf(requisition); // Generate PDF URL
    this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    this.displayPreviewDialog = true;
  }

  async approveIssueSlip(requisition: Requisition) {
  this.confirmationService.confirm({
    message: 'Are you sure you want to approve this issue slip?',
    header: 'Confirm Approval',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        this.loading = true;

        // Update requisition status to 'completed'
        const updatedRequisition = {
          ...requisition,
          issueSlipStatus: 'completed' as const, // Explicitly set status to "completed"
          issuedStocks: requisition.issuedStocks?.map(stock => ({
            ...stock,
            status: 'Approved' as const, // Explicitly set status to "Approved"
          })),
          lastModified: new Date()
        };

        await this.requisitionService.updateRequisition(updatedRequisition);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Issue slip has been approved successfully'
        });

        await this.loadRequisitions(); // Reload requisitions
      } catch (error) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    }
  });
}

async rejectIssueSlip(requisition: Requisition) {
  this.confirmationService.confirm({
    message: 'Are you sure you want to reject this issue slip?',
    header: 'Confirm Rejection',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        this.loading = true;

        // Update requisition status to 'rejected'
        const updatedRequisition = {
          ...requisition,
          issueSlipStatus: 'rejected' as const, // Explicitly set status to "rejected"
          issuedStocks: requisition.issuedStocks?.map(stock => ({
            ...stock,
            status: 'Rejected' as const, // Explicitly set status to "Rejected"
          })),
          lastModified: new Date()
        };

        await this.requisitionService.updateRequisition(updatedRequisition);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Issue slip has been rejected successfully'
        });

        await this.loadRequisitions(); // Reload requisitions
      } catch (error) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    }
  });
}

  // Generate PDF for issue slip (placeholder)
  private generateIssuePdf(requisition: Requisition): string {
    // Implement PDF generation logic here
    return 'data:application/pdf;base64,....';
  }

  // Handle errors
  private handleError(error: any) {
    console.error('Error:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.message || 'An error occurred'
    });
  }
}