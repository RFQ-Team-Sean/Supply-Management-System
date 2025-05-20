// ris.component.ts
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-ris',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './ris.component.html',
  styleUrls: ['./ris.component.scss']
})
export class RisComponent {
  risData = {
    agency: 'DepEd-Division of Antipolo City',
    division: 'Antipolo',
    responsibleCenter: 'Main Office',
    risNo: 'RIS-2023-001',
    date: '2023-12-25',
    officeCode: 'DEPT-EDU-ANT',
    saiNo: 'SAI-12345',
    stockNo: 'STK-789',
    unit: 'pcs',
    description: 'Office Supplies',
    quantityRequisition: 50,
    quantityIssuance: 50,
    remarks: 'Urgent',
    purpose: 'General office supplies replenishment',
    requestedBy: 'Michael P. Glorial',
    approvedBy: 'Dr. Rommel C. Bautista, CESO V',
    issuedBy: 'Supply Officer',
    receivedBy: 'Department Head',
    designationRequested: 'Administrative Officer IV',
    designationApproved: 'Schools Division Superintendent',
    designationIssued: 'Supply Officer',
    designationReceived: 'Department Manager'
  };

  exportPdf() {
    const content = document.createElement('div');
    content.style.fontFamily = 'Arial';
    content.style.padding = '20px';
    
    content.innerHTML = `
      <div style="margin-bottom: 20px; text-align: center;">
        <h3>Appendix 63</h3>
        <h2>REQUISITION AND ISSUE SLIP</h2>
      </div>

      <table style="width: 100%; margin-bottom: 15px; border: 1px solid black; border-collapse: collapse;">
        <tr>
          <td style="border: 1px solid black; padding: 8px; width: 25%;"><strong>Agency:</strong> ${this.risData.agency}</td>
          <td style="border: 1px solid black; padding: 8px; width: 25%;"><strong>RIS No.:</strong> ${this.risData.risNo}</td>
          <td style="border: 1px solid black; padding: 8px; width: 25%;"><strong>SAI No.:</strong> ${this.risData.saiNo}</td>
          <td style="border: 1px solid black; padding: 8px; width: 25%;"><strong>Date:</strong> ${this.risData.date}</td>
        </tr>
        <tr>
          <td style="border: 1px solid black; padding: 8px;"><strong>Division:</strong> ${this.risData.division}</td>
          <td style="border: 1px solid black; padding: 8px;"><strong>Office Code:</strong> ${this.risData.officeCode}</td>
          <td colspan="2" style="border: 1px solid black; padding: 8px;"><strong>Responsible Center:</strong> ${this.risData.responsibleCenter}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 8px;">Stock No.</th>
            <th style="border: 1px solid black; padding: 8px;">Unit</th>
            <th style="border: 1px solid black; padding: 8px;">Description</th>
            <th style="border: 1px solid black; padding: 8px;">Quantity Requisition</th>
            <th style="border: 1px solid black; padding: 8px;">Quantity Issuance</th>
            <th style="border: 1px solid black; padding: 8px;">Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid black; padding: 8px;">${this.risData.stockNo}</td>
            <td style="border: 1px solid black; padding: 8px;">${this.risData.unit}</td>
            <td style="border: 1px solid black; padding: 8px;">${this.risData.description}</td>
            <td style="border: 1px solid black; padding: 8px;">${this.risData.quantityRequisition}</td>
            <td style="border: 1px solid black; padding: 8px;">${this.risData.quantityIssuance}</td>
            <td style="border: 1px solid black; padding: 8px;">${this.risData.remarks}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-bottom: 15px; border: 1px solid black; padding: 8px;">
        <strong>Purpose:</strong> ${this.risData.purpose}
      </div>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
        <tr>
          <td style="border: 1px solid black; padding: 8px; vertical-align: top; width: 25%;">
            <strong>Requested by:</strong><br>
            <div style="border-bottom: 1px solid black; margin: 40px 0 20px 0;"></div>
            ${this.risData.requestedBy}<br>
            ${this.risData.designationRequested}
          </td>
          <td style="border: 1px solid black; padding: 8px; vertical-align: top; width: 25%;">
            <strong>Approved by:</strong><br>
            <div style="border-bottom: 1px solid black; margin: 40px 0 20px 0;"></div>
            ${this.risData.approvedBy}<br>
            ${this.risData.designationApproved}
          </td>
          <td style="border: 1px solid black; padding: 8px; vertical-align: top; width: 25%;">
            <strong>Issued by:</strong><br>
            <div style="border-bottom: 1px solid black; margin: 40px 0 20px 0;"></div>
            ${this.risData.issuedBy}<br>
            ${this.risData.designationIssued}
          </td>
          <td style="border: 1px solid black; padding: 8px; vertical-align: top; width: 25%;">
            <strong>Received by:</strong><br>
            <div style="border-bottom: 1px solid black; margin: 40px 0 20px 0;"></div>
            ${this.risData.receivedBy}<br>
            ${this.risData.designationReceived}
          </td>
        </tr>
      </table>
    `;

    document.body.appendChild(content);

    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('ris-form.pdf');
      document.body.removeChild(content);
    });
  }
} 