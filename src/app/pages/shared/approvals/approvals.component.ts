import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RequisitionService, Requisition } from 'src/app/services/requisition.service';
import { User, UserService } from 'src/app/services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ApprovalSequenceService } from 'src/app/services/approval-sequence.service';
import { firstValueFrom } from 'rxjs';
import { DepartmentService } from 'src/app/services/departments.service';
import { NotificationService } from 'src/app/services/notifications.service';
import { PurchaseReqComponent } from '../purchase-req/purchase-req.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    PurchaseReqComponent, // Add this line
    FormsModule
  ],
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
  providers: [MessageService],
})
export class ApprovalsComponent implements OnInit {
  requisitions: (Requisition & { approvalSequenceDetails?: any })[] = [];
  loading = false;
  displayPdfDialog = false;
  displaySignatureDialog = false;
  displayPreviewDialog = false;
  displayPurchaseReqDialog = false; // Add this line
  selectedPdfUrl: SafeResourceUrl | null = null;
  selectedRequest: Requisition | null = null;
  selectedRequisitionId: string | null = null; // Add this line
  signatureDataUrl: string | null = null;
  departmentName: string = 'N/A';
  officeName: string = 'N/A';
    approvalComment: string = ''; 
  currentUser?: User;

  @ViewChild('signatureCanvas', { static: false })
  signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private canvasContext!: CanvasRenderingContext2D;
  private isSigned = false;

  constructor(
    private requisitionService: RequisitionService,
    private userService: UserService,
    private approvalSequenceService: ApprovalSequenceService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    await this.loadRequisitions();
    await this.loadDepartmentAndOfficeNames();
  }

  private async loadRequisitions() {
    try {
      this.loading = true;
      this.currentUser = this.userService.getUser();
      const allRequisitions = await this.requisitionService.getAllRequisitions();
      const allSequences = await this.requisitionService.getAllApprovalSequences();

      this.requisitions = allRequisitions
        .map((req) => {
          const currentSequence = allSequences.find(
            (seq) => seq.id === req.approvalSequenceId
          );

          return {
            ...req,
            approvalSequenceDetails: currentSequence,
          };
        })
        .filter((req) => req.approvalSequenceDetails && (req.approvalSequenceDetails?.userId === this.currentUser?.id || this.currentUser?.role == 'enduser' || this.currentUser?.role == 'superadmin' || 
          (this.currentUser?.role =='supply' && req.approvalSequenceDetails.roleCode == 'inspection')));
    } catch (error) {
      console.error('Failed to load requisitions:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load requisitions.',
      });
    } finally {
      this.loading = false;
    }
  }

  async loadDepartmentAndOfficeNames() {
    try {
      const currentUser = this.userService.getUser();
      if (!currentUser?.id) {
        this.departmentName = 'N/A';
        this.officeName = 'N/A';
        return;
      }

      const user = this.userService.getUserById(currentUser.id);
      if (!user?.officeId) {
        this.departmentName = 'N/A';
        this.officeName = 'N/A';
        return;
      }

      const offices = await this.departmentService.getAllOffices();
      const userOffice = offices.find(office => office.id === user.officeId);

      if (userOffice) {
        const departments = await this.departmentService.getAllDepartments();
        const userDepartment = departments.find(department => department.id === userOffice.departmentId);
        this.departmentName = userDepartment?.name || 'N/A';
        this.officeName = userOffice.name || 'N/A';
      } else {
        this.departmentName = 'N/A';
        this.officeName = 'N/A';
      }
    } catch (error) {
      console.error('Failed to load department and office names:', error);
      this.departmentName = 'N/A';
      this.officeName = 'N/A';
    }
  }

  viewAttachment(pdfUrl: string, title: string) {
    this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    this.displayPdfDialog = true;
  }


  
// Sets up the signature canvas for drawing.
private setupSignatureCanvas() {
  const canvas = this.signatureCanvas.nativeElement;
  this.canvasContext = canvas.getContext('2d')!;
  this.canvasContext.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  this.isSigned = false; // Reset the signature flag

  let isDrawing = false;

  // Event listeners for drawing on the canvas
  canvas.addEventListener('mousedown', () => {
    isDrawing = true;
    this.isSigned = true; // Mark that a signature has been drawn
    this.canvasContext.beginPath(); // Start a new drawing path
  });

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (isDrawing) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left; // Get the X coordinate relative to the canvas
      const y = event.clientY - rect.top; // Get the Y coordinate relative to the canvas
      this.canvasContext.lineTo(x, y); // Draw a line to the new coordinates
      this.canvasContext.stroke(); // Render the line
    }
  });

  canvas.addEventListener('mouseup', () => (isDrawing = false)); // Stop drawing when the mouse is released
  canvas.addEventListener('mouseout', () => (isDrawing = false)); // Stop drawing when the mouse leaves the canvas
}

// Clears the signature canvas.
clearSignature() {
  const canvas = this.signatureCanvas.nativeElement;
  this.canvasContext.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  this.isSigned = false; // Reset the signature flag
}

 async submitApproval() {
  try {
    if (!this.selectedRequest) {
      throw new Error('No request selected for approval.');
    }

    if (!this.isSigned) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Signature',
        detail: 'Please provide your signature before approving.',
      });
      return;
    }

    // Capture the signature
    const canvas = this.signatureCanvas.nativeElement;
    this.signatureDataUrl = canvas.toDataURL('image/png');

    // Add the approval history entry
    const approverName = this.currentUser?.fullname || 'Unknown';
    this.selectedRequest.approvalHistory = this.selectedRequest.approvalHistory || [];
    this.selectedRequest.approvalHistory.push({
      level: this.selectedRequest.currentApprovalLevel,
      status: 'Approved',
      timestamp: new Date(),
      comments: this.approvalComment, // Save the comment
      approversName: approverName,
      signature: this.signatureDataUrl, // Attach the captured signature
    });

    // Advance the approval level or finalize approval
    const allSequences = await this.requisitionService.getAllApprovalSequences();
    const currentSequenceIndex = allSequences.findIndex(seq => seq.id === this.selectedRequest?.approvalSequenceId);

    if (currentSequenceIndex + 1 < allSequences.length) {
      // Move to the next level
      this.selectedRequest.approvalSequenceId = allSequences[currentSequenceIndex + 1].id;
      this.selectedRequest.currentApprovalLevel = allSequences[currentSequenceIndex + 1].level;

      // Notify the next approver(s)
      const nextUserRole = allSequences[currentSequenceIndex + 1].roleCode;
      const users = await firstValueFrom(this.userService.getAllUsers());
      users.forEach(async user => {
        if (this.selectedRequest) {
          const nextUserRole = allSequences[currentSequenceIndex + 1]?.roleCode;
          const users = await firstValueFrom(this.userService.getAllUsers());

          users.forEach(user => {
            if (
              user.role === 'superadmin' ||
              user.role === nextUserRole ||
              user.id === this.selectedRequest!.createdByUserId // Use non-null assertion
            ) {
              this.notificationService.addNotification(
                `Requisition No. ${this.selectedRequest!.id} has been approved and is now under ${allSequences[currentSequenceIndex + 1]?.name}.`, // Optional chaining
                'info',
                user.id
              );
            }
          });
        }
      });
    } else {
      // Finalize approval
      this.selectedRequest.approvalSequenceId = undefined;
      this.selectedRequest.currentApprovalLevel = 0;
      this.selectedRequest.approvalStatus = 'Approved';
    }

    // Save the updated requisition
    await this.requisitionService.updateRequisition(this.selectedRequest);

    this.loadRequisitions();

    // Show success message
    this.messageService.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'The requisition has been successfully approved.',
    });

    // Close dialogs
    this.displaySignatureDialog = false;
    this.signatureDataUrl = null;
    this.approvalComment = ''; // Clear the comment field
  } catch (error) {
    console.error('Failed to approve requisition:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to approve requisition.',
    });
  }
}

  async confirmApproval() {
    try {
      if (!this.selectedRequest || !this.signatureDataUrl) {
        throw new Error('No request or signature selected for approval.');
      }

      // Add the approval history entry with a Date object for timestamp
      this.selectedRequest.approvalHistory = this.selectedRequest.approvalHistory || [];
      this.selectedRequest.approvalHistory.push({
        level: this.selectedRequest.currentApprovalLevel,
        status: 'Approved',
        timestamp: new Date(), // Ensure this is a Date object
        comments: '',
      });

      // Update the requisition with the signature and approval status
      this.selectedRequest.signature = this.signatureDataUrl;
      // this.selectedRequest.approvalStatus = 'Approved';
      // this.selectedRequest.currentApprovalLevel += 1;

      // Save the updated requisition
      await this.requisitionService.updateRequisition(this.selectedRequest);
      
      this.loadRequisitions();

      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Requisition approved successfully.',
      });

      // Close the preview dialog
      this.displayPreviewDialog = false;
      this.signatureDataUrl = null;
    } catch (error) {
      console.error('Failed to confirm approval:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to confirm approval.',
      });
    }
  }

  closePreviewDialog() {
    this.displayPreviewDialog = false;
    this.signatureDataUrl = null;
  }

  async onReject(req: Requisition) {
    try {
      this.selectedRequest = req;
      const allSequences = await this.requisitionService.getAllApprovalSequences();

      const users = await firstValueFrom (this.userService.getAllUsers());

      const currentSequenceIndex = allSequences.findIndex(seq=>seq.id==this.selectedRequest?.approvalSequenceId)
      if(currentSequenceIndex - 1  >= 0){
        this.selectedRequest.approvalSequenceId = allSequences[currentSequenceIndex - 1].id;
        await this.requisitionService.updateRequisition(this.selectedRequest);
        const lastUserRole = allSequences[currentSequenceIndex-1].roleCode
      
        for(let user of users){
          if(user.role == 'superadmin' || lastUserRole == user.role || user.id == this.selectedRequest.createdByUserId ){
            this.notificationService.addNotification(
            `Requisiton No. ${this.selectedRequest.id} has been rejected back to ${allSequences[currentSequenceIndex-1].name}.`,
            'info',
            user.id
            )
          }
        }
      }

      this.loadRequisitions();
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Requisition rejected successfully.',
      });
    } catch (error) {
      console.error('Failed to reject requisition:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject requisition.',
      });
    }
  }

  closeSignatureDialog() {
    this.displaySignatureDialog = false;
    this.clearSignature();
    this.selectedRequest = null;
  }

 // Opens the signature dialog for the selected requisition.
openSignatureDialog(request: Requisition) {
  this.selectedRequest = request;
  this.displaySignatureDialog = true;
  setTimeout(() => this.setupSignatureCanvas(), 0); // Initialize the canvas after the dialog is opened
}

// Opens the Purchase Request dialog for the selected requisition.
openPurchaseReqDialog(requisitionId: string) {
  this.selectedRequisitionId = requisitionId;
  this.displayPurchaseReqDialog = true;
}

  closePurchaseReqDialog() {
  this.displayPurchaseReqDialog = false;
  this.selectedRequisitionId = null; // Reset the selected requisition ID
}
}