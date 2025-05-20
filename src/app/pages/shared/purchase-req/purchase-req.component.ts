import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RequisitionService, Requisition } from 'src/app/services/requisition.service';
import { ApprovalSequenceService } from 'src/app/services/approval-sequence.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-purchase-req',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule],
  templateUrl: './purchase-req.component.html',
  styleUrls: ['./purchase-req.component.scss']
})
export class PurchaseReqComponent implements OnInit {
  @Input() requisitionId: string = '';
  requisition: Requisition | undefined;
  approvers: { accounting: string, inspection: string, president: string } = {
    accounting: '',
    inspection: '',
    president: ''
  };

  constructor(
    private requisitionService: RequisitionService,
    private approvalSequenceService: ApprovalSequenceService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.requisitionId) {
      this.loadRequisition();
    }
  }

  async loadRequisition() {
    if (!this.requisitionId) {
      alert('Please enter a valid Requisition ID.');
      return;
    }

    try {
      this.requisition = await this.requisitionService.getRequisitionById(this.requisitionId);
      if (this.requisition) {
        await this.loadApprovers(this.requisition.approvalSequenceId);
      } else {
        alert('Requisition not found.');
      }
    } catch (error) {
      console.error('Error loading requisition:', error);
      alert('Failed to load requisition.');
    }
  }

  async loadApprovers(approvalSequenceId: string | undefined) {
    if (!approvalSequenceId) return;

    const sequences = await this.approvalSequenceService.getSequencesByType('procurement').toPromise();
    if (!sequences) return;

    sequences.forEach(sequence => {
      if (sequence.roleCode === 'accounting') {
        this.approvers.accounting = sequence.userFullName;
      } else if (sequence.roleCode === 'inspection') {
        this.approvers.inspection = sequence.userFullName;
      } else if (sequence.roleCode === 'president') {
        this.approvers.president = sequence.userFullName;
      }
    });
  }

  getSignature(role: string): string | undefined {
    if (!this.requisition?.approvalHistory) return undefined;

    const approval = this.requisition.approvalHistory.find(history => {
      if (role === 'accounting' && history.approversName === this.approvers.accounting) return true;
      if (role === 'inspection' && history.approversName === this.approvers.inspection) return true;
      if (role === 'president' && history.approversName === this.approvers.president) return true;
      return false;
    });

    return approval?.signature;
  }

  exportPdf() {
    const content = document.querySelector('.preview-section') as HTMLElement;

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
    });
  }
}