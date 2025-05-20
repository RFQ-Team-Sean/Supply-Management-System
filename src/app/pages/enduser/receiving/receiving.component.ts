// receiving.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Requisition, RequisitionService } from 'src/app/services/requisition.service';
import jsPDF from 'jspdf';
import { UserService } from 'src/app/services/user.service';
import 'jspdf-autotable';
import html2pdf from 'html2pdf.js'; // Correct import

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable: { finalY: number };
}

const jsPDFWithAutoTable = jsPDF as unknown as { new (): jsPDFWithAutoTable };

@Component({
  selector: 'app-receiving',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TabViewModule
  ],
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.scss'],
  providers: [MessageService, ConfirmationService]
})

export class ReceivingComponent implements OnInit {
  level7Requisitions: Requisition[] = [];
  displaySignatureDialog: boolean = false;
  selectedRequisition: Requisition | null = null;

  @ViewChild('signatureCanvas', { static: false }) signatureCanvas!: ElementRef;
  private canvasContext!: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private signatureDataUrl: string = '';

  constructor(
    private requisitionService: RequisitionService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadLevel7Requisitions();
  }

  async loadLevel7Requisitions(): Promise<void> {
    try {
      const allRequisitions = await this.requisitionService.getAllRequisitions();
      this.level7Requisitions = allRequisitions.filter(req => req.currentApprovalLevel === 7);
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load requisitions.' });
    }
  }

  openSignatureDialog(requisition: Requisition): void {
    this.selectedRequisition = requisition;
    this.displaySignatureDialog = true;
    setTimeout(() => this.setupSignaturePad(), 100);
  }

  setupSignaturePad(): void {
    if (!this.signatureCanvas) return;

    this.canvasContext = this.signatureCanvas.nativeElement.getContext('2d');
    this.canvasContext.clearRect(0, 0, this.signatureCanvas.nativeElement.width, this.signatureCanvas.nativeElement.height);
    
    this.signatureCanvas.nativeElement.addEventListener('mousedown', this.startDrawing.bind(this));
    this.signatureCanvas.nativeElement.addEventListener('mousemove', this.draw.bind(this));
    this.signatureCanvas.nativeElement.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.signatureCanvas.nativeElement.addEventListener('mouseleave', this.stopDrawing.bind(this));
  }

  startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    this.canvasContext.lineTo(event.offsetX, event.offsetY);
    this.canvasContext.stroke();
  }

  stopDrawing(): void {
    this.isDrawing = false;
    this.signatureDataUrl = this.signatureCanvas.nativeElement.toDataURL();
  }

  clearSignature(): void {
    this.canvasContext.clearRect(0, 0, this.signatureCanvas.nativeElement.width, this.signatureCanvas.nativeElement.height);
    this.signatureDataUrl = '';
  }

  async submitApproval(): Promise<void> {
    if (!this.selectedRequisition) return;

    if (!this.signatureDataUrl) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please provide a signature before submitting.' });
      return;
    }

    try {
      const currentUser = this.userService.getUser();

      const updatedRequisition: Requisition = {
        ...this.selectedRequisition,
        currentApprovalLevel: this.selectedRequisition.currentApprovalLevel + 1,
        approvalHistory: [
          ...(this.selectedRequisition.approvalHistory || []),
          {
            level: this.selectedRequisition.currentApprovalLevel,
            status: 'Approved',
            timestamp: new Date(),
            approversName: currentUser?.fullname || 'Unknown',
            signature: this.signatureDataUrl
          }
        ],
        approvalStatus: 'Approved',
        lastModified: new Date()
      };

      await this.requisitionService.updateRequisition(updatedRequisition);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Requisition approved successfully!' });

      this.displaySignatureDialog = false;
      await this.loadLevel7Requisitions();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve requisition.' });
    }
  }

  async disapproveRequisition(requisition: Requisition): Promise<void> {
    try {
      const updatedRequisition: Requisition = {
        ...requisition,
        approvalStatus: 'Rejected',
        lastModified: new Date()
      };

      await this.requisitionService.updateRequisition(updatedRequisition);

      this.messageService.add({ severity: 'info', summary: 'Requisition Rejected', detail: 'The requisition has been disapproved.' });

      await this.loadLevel7Requisitions();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject requisition.' });
    }
  }
}