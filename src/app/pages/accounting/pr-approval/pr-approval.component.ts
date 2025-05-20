import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { RequisitionService } from 'src/app/services/requisition.service';
import { UserService } from 'src/app/services/user.service';
import { DepartmentService } from 'src/app/services/departments.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview'; // Import TabViewModule
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ApprovalSequenceService } from 'src/app/services/approval-sequence.service';

@Component({
  selector: 'app-pr-approval',
  templateUrl: './pr-approval.component.html',
  styleUrls: ['./pr-approval.component.scss'],
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    DialogModule,
    TabViewModule, // Add TabViewModule to imports
  ],
})
export class PrApprovalComponent implements OnInit {
  purchaseRequests: any[] = [];
  approvedRequests: any[] = [];
  loading = true;
  displayPpmpPreview = false;
  displaySignatureDialog = false;
  displayPrPreview = false;
  selectedRequisitionPdf: SafeResourceUrl | null = null;
  selectedRequest: any | null = null;
  generatedPrHtml: string = '';
  loggedInUser: any | null = null;
  departmentName: string = 'Department';
  officeName: string = 'Office';
  approvalSequences: any[] = [];

  @ViewChild('signatureCanvas', { static: false })
  signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private canvasContext!: CanvasRenderingContext2D;
  private isSigned = false;

  constructor(
    private requisitionService: RequisitionService,
    private userService: UserService,
    private departmentService: DepartmentService,
    private approvalSequenceService: ApprovalSequenceService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
  this.loggedInUser = this.userService.getUser();
  await this.loadApprovalSequences();
  await this.loadRequisitions(); // Reload requisitions
  await this.loadDepartmentAndOfficeNames();
}


//   async loadRequisitions(): Promise<void> {
//   try {
//     this.loading = true;
//     const allRequisitions = await this.requisitionService.getAllRequisitions();
//     this.purchaseRequests = allRequisitions.filter(req => req.status === 'Pending');
//     this.approvedRequests = allRequisitions.filter(req => req.status === 'Approved');
//   } catch (error) {
//     this.handleError(error, 'Error loading requisitions');
//   } finally {
//     this.loading = false;
//   }
  // }
  
  async loadRequisitions(): Promise<void> {
  try {
    this.loading = true;
    const allRequisitions = await this.requisitionService.getAllRequisitions();

    // Filter requisitions based on their approval level
    this.purchaseRequests = allRequisitions.filter(req => req.currentApprovalLevel === 1 && req.status === 'Pending');
    this.approvedRequests = allRequisitions.filter(req => req.currentApprovalLevel === 2 && req.status === 'Pending');
  } catch (error) {
    this.handleError(error, 'Error loading requisitions');
  } finally {
    this.loading = false;
  }
}

async loadApprovalSequences(): Promise<void> {
    try {
      this.approvalSequences = await this.approvalSequenceService.getAllSequences().toPromise() || [];
    } catch (error) {
      this.handleError(error, 'Error loading approval sequences');
    }
  }

  // Load pending requisitions
  async loadPendingRequests() {
    try {
      this.loading = true;
      this.purchaseRequests = await this.requisitionService.getPendingRequisitions();
      console.log('Loaded pending requests:', this.purchaseRequests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load pending requests.',
      });
    } finally {
      this.loading = false;
    }
  }

  // Load approved requisitions
  async loadApprovedRequests() {
    try {
      this.loading = true;
      const allRequisitions = await this.requisitionService.getAllRequisitions();
      this.approvedRequests = allRequisitions.filter((req) => req.status === 'Approved');
      console.log('Loaded approved requests:', this.approvedRequests);
    } catch (error) {
      console.error('Error loading approved requests:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load approved requests.',
      });
    } finally {
      this.loading = false;
    }
  }

  // Load department and office names
  async loadDepartmentAndOfficeNames() {
    try {
      const departments = await this.departmentService.getAllDepartments();
      const offices = await this.departmentService.getAllOffices();

      if (departments.length > 0) {
        this.departmentName = departments[0].name; // Set the first department
      }
      if (offices.length > 0) {
        this.officeName = offices[0].name; // Set the first office
      }
    } catch (error) {
      console.error('Error loading department and office data:', error);
    }
  }

  // View PPMP attachment
 viewPPMP(request: any) {
  if (request.ppmpAttachment) {
    this.selectedRequisitionPdf = this.sanitizer.bypassSecurityTrustResourceUrl(request.ppmpAttachment);
    this.selectedRequest = request;
    this.displayPpmpPreview = true;
  } else {
    this.messageService.add({
      severity: 'warn',
      summary: 'No Document',
      detail: 'PPMP document is not available for this request.',
    });
  }
}

  // View Purchase Request attachment
  viewPurchaseRequest(request: any) {
    if (request.purchaseRequestAttachment) {
      this.selectedRequisitionPdf = this.sanitizer.bypassSecurityTrustResourceUrl(
        request.purchaseRequestAttachment
      );
      this.selectedRequest = request;
      this.displayPpmpPreview = true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Document',
        detail: 'Purchase Request document is not available for this request.',
      });
    }
  }

  // Open signature dialog
  openSignatureDialog(request: any) {
    this.selectedRequest = request;
    this.displaySignatureDialog = true;
    setTimeout(() => this.setupSignatureCanvas(), 0);
  }

  // Set up the signature canvas
  private setupSignatureCanvas() {
    const canvas = this.signatureCanvas.nativeElement;
    this.canvasContext = canvas.getContext('2d')!;
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    this.isSigned = false; // Reset signature flag

    let isDrawing = false;

    canvas.addEventListener('mousedown', () => {
      isDrawing = true;
      this.isSigned = true; // Mark as signed
      this.canvasContext.beginPath();
    });

    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.canvasContext.lineTo(x, y);
        this.canvasContext.stroke();
      }
    });

    canvas.addEventListener('mouseup', () => (isDrawing = false));
    canvas.addEventListener('mouseout', () => (isDrawing = false));
  }

  // Clear the signature
  clearSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    this.isSigned = false; // Reset signature flag
  }

  // Submit approval
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

    const canvas = this.signatureCanvas.nativeElement;
    const signatureDataUrl = canvas.toDataURL('image/png');

    // Generate the PR HTML for preview
    this.generatedPrHtml = this.generatePrHtml(this.selectedRequest, signatureDataUrl);

    // Open PR Preview Dialog
    this.displayPrPreview = true;
    this.displaySignatureDialog = false; // Close signature dialog
  } catch (error) {
    this.handleError(error, 'Failed to preview purchase request.');
  }
}

async confirmApproval() {
  try {
    if (!this.selectedRequest) throw new Error('No request selected');
    
    const canvas = this.signatureCanvas.nativeElement;
    const signatureDataUrl = canvas.toDataURL('image/png');
    const prPdfBase64 = this.generatePurchaseRequestPdf(this.selectedRequest, signatureDataUrl);

    // Update requisition
    const requisition = await this.requisitionService.getRequisitionById(this.selectedRequest.id);
    if (!requisition) throw new Error('Requisition not found');

    requisition.dateCreated = new Date(requisition.dateCreated!);
    requisition.lastModified = new Date();
    requisition.purchaseRequestAttachment = prPdfBase64;
    
    requisition.approvalHistory = [
      ...(requisition.approvalHistory || []).map(h => ({
        ...h,
        timestamp: new Date(h.timestamp)
      })),
      {
        level: requisition.currentApprovalLevel,
        status: 'Approved',
        timestamp: new Date(),
        comments: ''
      }
    ];

    requisition.currentApprovalLevel++;
    
    if (requisition.currentApprovalLevel > 4) {
      requisition.approvalStatus = 'Approved';
      requisition.status = 'Approved';
    } else {
      requisition.approvalStatus = 'Pending';
    }

    await this.requisitionService.updateRequisition(requisition);
    await this.loadRequisitions();

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Purchase Request approved successfully'
    });

    this.displayPrPreview = false;
    this.displaySignatureDialog = false;
    
  } catch (error) {
    this.handleError(error, 'Failed to approve Purchase Request');
  } finally {
    this.selectedRequest = null;
    this.loading = false;
  }
}
  
  private handleError(error: any, defaultMessage: string): void {
  console.error(error);
  const errorMessage = error?.message || defaultMessage;
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: errorMessage,
  });
}

  // Generate Purchase Request PDF
  private generatePurchaseRequestPdf(request: any, signature: string): string {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // Header Section
    doc.setFontSize(16);
    doc.text('Purchase Request', pageWidth / 2, 50, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`PR No.: ${this.generateUniqueId()}`, margin, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 100, 80);

    doc.text('Agency: CAGAYAN DE ORO STATE COLLEGE', margin, 110);
    doc.text(`Department: ${this.departmentName}`, margin, 130);
    doc.text(`Office: ${this.officeName}`, margin, 150);

    // Table Header
    const tableStartY = 200;
    const rowHeight = 20;

    const colWidths = [
      40, // Quantity
      50, // Unit
      pageWidth - margin * 2 - 250, // Description (dynamic width)
      60, // Unit Cost
      80, // Total Cost
    ];

    const headers = ['Qty', 'Unit', 'Item Description', 'Unit Cost', 'Total Cost'];
    let xPos = margin;
    let yPos = tableStartY;

    doc.setFontSize(10);

    // Draw headers
    headers.forEach((header, i) => {
      doc.rect(xPos, yPos, colWidths[i], rowHeight);
      doc.text(header, xPos + 5, yPos + 14);
      xPos += colWidths[i];
    });

    yPos += rowHeight;

    // Table Rows
    let grandTotal = 0;

    request.products.forEach((product: any) => {
      const totalCost = product.quantity * product.price;
      grandTotal += totalCost;

      xPos = margin;
      [
        product.quantity.toString(),
        'Unit',
        product.name,
        `${product.price.toFixed(2)}`,
        `${totalCost.toFixed(2)}`,
      ].forEach((text, i) => {
        doc.rect(xPos, yPos, colWidths[i], rowHeight);
        doc.text(text, xPos + 5, yPos + 14);
        xPos += colWidths[i];
      });

      yPos += rowHeight;

      // Handle page overflow
      if (yPos > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPos = margin;

        // Redraw table headers
        xPos = margin;
        headers.forEach((header, i) => {
          doc.rect(xPos, yPos, colWidths[i], rowHeight);
          doc.text(header, xPos + 5, yPos + 14);
          xPos += colWidths[i];
        });

        yPos += rowHeight;
      }
    });

    // Footer Section
    yPos += 20;
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, margin, yPos);

    // Signature Section
    yPos += 50;
    doc.text('Requested By:', margin, yPos);
    doc.text(request.createdByUserName || 'N/A', margin + 100, yPos);

    doc.text('Approved By:', pageWidth / 2, yPos);
    doc.text(this.loggedInUser?.fullname || 'N/A', pageWidth / 2 + 100, yPos);

    if (signature) {
      const imgWidth = 100;
      const imgHeight = 50;
      doc.addImage(signature, 'PNG', pageWidth / 2 + 100, yPos + 10, imgWidth, imgHeight);
    }

    // Return the PDF as a Base64 string
    return doc.output('datauristring');
  }

  // Generate a unique ID
  generateUniqueId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  // Close signature dialog
  closeSignatureDialog() {
    this.displaySignatureDialog = false;
    this.clearSignature();
    this.selectedRequest = null;
  }

  // Close PR preview dialog
  closePrPreview() {
    this.displayPrPreview = false;
  }

  // Generate PR HTML
  generatePrHtml(request: any, signature: string): string {
    return `
      <div class="p-10 bg-white shadow-md rounded-lg">
        <h1 class="text-2xl font-bold mb-4 flex justify-center">Purchase Request</h1>
        <div class="mb-4 text-xl">
          <div class="flex flex-row justify-between">
            <p><strong>PR No.:</strong> ${this.generateUniqueId()}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p><strong>Agency:</strong> CAGAYAN DE ORO STATE COLLEGE</p>
          <div class="flex flex-row gap-20">
            <p><strong>Department:</strong> ${this.departmentName}</p>
            <p><strong>Office:</strong> ${this.officeName}</p>
          </div>
        </div>
        <table class="w-full border-collapse border border-gray-300 text-xl">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-4">Qty</th>
              <th class="border border-gray-300 p-4">Unit</th>
              <th class="border border-gray-300 p-4">Item Description</th>
              <th class="border border-gray-300 p-4">Stock No</th>
              <th class="border border-gray-300 p-4">Estimated Unit Cost</th>
              <th class="border border-gray-300 p-4">Estimated Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${request.products
              .map(
                (product: any) => `
                <tr>
                  <td class="border border-gray-300 p-4">${product.quantity}</td>
                  <td class="border border-gray-300 p-4">Unit</td>
                  <td class="border border-gray-300 p-4">${product.name}</td>
                  <td class="border border-gray-300 p-4">-</td>
                  <td class="border border-gray-300 p-4">${product.price}</td>
                  <td class="border border-gray-300 p-4">${
                    product.quantity * product.price
                  }</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
        <div class="mt-4 text-xl flex flex-row justify-between">
          <p class="ml-20"><strong>Requested By:</strong><br> ${
            request.createdByUserName || 'N/A'
          }</p>
          <p class="mr-20"><strong>Approved By:</strong><br> ${
            this.loggedInUser?.fullname || 'N/A'
          }</p>
        </div>
        <div class="mt-4 text-xl flex flex-row justify-between">
          <p class="ml-20"><strong>Signature:</strong><br> <img src="${signature}" alt="Signature" /></p>
        </div>
      </div>
    `;
  }

  // Generate PR PDF
  generatePrPdf() {
    try {
      if (!this.generatedPrHtml) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No Purchase Request to generate a PDF.',
        });
        return;
      }

      const content = document.createElement('div');
      content.innerHTML = this.generatedPrHtml;

      document.body.appendChild(content);

      html2canvas(content).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('purchase-request.pdf');
        document.body.removeChild(content);
        this.displayPrPreview = false;
      }).catch((error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate PDF.',
        });
        console.error('Error generating PDF:', error);
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while generating the Purchase Request PDF.',
      });
    }
  }

  async updateRequestStatus(requestId: string, status: 'Approved' | 'Rejected') {
  try {
    this.loading = true;

    // Fetch the requisition by ID
    const requisition = await this.requisitionService.getRequisitionById(requestId);
    if (!requisition) {
      throw new Error('Requisition not found.');
    }

    // Update the requisition status
    const updatedRequisition = {
      ...requisition,
      status: status,
    };

    // Save the updated requisition
    await this.requisitionService.updateRequisition(updatedRequisition);

    // Reload pending requests to reflect changes
    await this.loadPendingRequests();

    // Show success message
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Request has been ${status.toLowerCase()}.`,
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update the request status.',
    });
  } finally {
    this.loading = false;
  }
  }
  
}