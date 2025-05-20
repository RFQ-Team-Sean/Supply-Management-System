import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rsmi',
  standalone: true,
  imports: [ButtonModule, TableModule, DialogModule, CardModule, ReactiveFormsModule, ChipModule, CommonModule],
  templateUrl: './rsmi.component.html',
  styleUrls: ['./rsmi.component.scss'],
})
export class RsmiComponent {
  rsmiForm: FormGroup;
  displayDialog: boolean = false;
  editingIndex: number = -1;

  // Realistic mock data
  rsmiReports = [
    {
      entityName: 'Department of Public Works',
      serialNo: 'RSMI-2023-001',
      fundCluster: 'General Fund',
      date: new Date('2023-10-15'),
      attachments: ['works_supplies.pdf', 'receipt_001.pdf']
    },
    {
      entityName: 'Health Services Division',
      serialNo: 'RSMI-2023-002',
      fundCluster: 'Emergency Funds',
      date: new Date('2023-10-18'),
      attachments: ['medical_supplies_order.pdf']
    },
    {
      entityName: 'Education Department',
      serialNo: 'RSMI-2023-003',
      fundCluster: 'Education Budget',
      date: new Date('2023-10-20'),
      attachments: ['school_supplies.pdf', 'delivery_confirmation.pdf']
    }
  ];

  mockData = {
    items: [
      {
        risNo: 'RIS-001',
        responsibilityCenterCode: 'RC-101',
        stockNo: 'STK-001',
        item: 'Office Supplies',
        unit: 'SET',
        quantityIssued: 10,
        unitCost: 100,
        amount: 1000
      }
    ],
    recapitulation: [
      {
        stockNo: 'STK-001',
        quantity: 10,
        unitCost: 100,
        totalCost: 1000,
        uacsObjectCode: 'UAC-001'
      }
    ],
    postedBy: 'John Doe',
    supplyCustodian: 'Jane Smith',
    accountingStaff: 'Mike Johnson',
    dateSigned: '2023-10-25'
  };

  constructor(private fb: FormBuilder) {
    this.rsmiForm = this.fb.group({
      entityName: ['', Validators.required],
      serialNo: ['', Validators.required],
      fundCluster: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  showDialog() {
    this.displayDialog = true;
    this.editingIndex = -1;
  }

  editReport(report: any) {
    this.editingIndex = this.rsmiReports.indexOf(report);
    this.rsmiForm.patchValue({
      ...report,
      date: report.date.toISOString().split('T')[0]
    });
    this.displayDialog = true;
  }

  deleteReport(report: any) {
    const index = this.rsmiReports.indexOf(report);
    if (index !== -1) {
      this.rsmiReports.splice(index, 1);
    }
  }

  addRSMI() {
    if (this.rsmiForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    const newReport = {
      ...this.rsmiForm.value,
      date: new Date(this.rsmiForm.value.date),
      attachments: ['new_attachment.pdf'] // Simulated attachment
    };

    if (this.editingIndex === -1) {
      this.rsmiReports.push(newReport);
    } else {
      this.rsmiReports[this.editingIndex] = newReport;
    }

    this.displayDialog = false;
    this.rsmiForm.reset();
  }

  exportPdf() {
    if (this.rsmiForm.invalid) {
      alert('Please fill out all fields in the form.');
      return;
    }

    const formValues = this.rsmiForm.value;

    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-10 bg-white shadow-md rounded-lg">
        <h1 class="text-4xl font-bold mb-4 flex justify-center">REPORT OF SUPPLIES AND MATERIALS ISSUED</h1>
        
        <!-- Entity Name, Serial No., Fund Cluster, and Date -->
        <div class="mb-4 text-2xl">
          <div class="flex flex-row justify-between">
            <p><strong>Entity Name:</strong> ${formValues.entityName}</p>
            <p><strong>Serial No.:</strong> ${formValues.serialNo}</p>
          </div>
          <div class="flex flex-row justify-between">
            <p><strong>Fund Cluster:</strong> ${formValues.fundCluster}</p>
            <p><strong>Date:</strong> ${formValues.date}</p>
          </div>
        </div>

        <!-- Items Issued Table -->
        <h2 class="text-2xl font-bold mb-2">Items Issued</h2>
        <table class="w-full border-collapse border border-gray-300 text-2xl">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-4">RIS No.</th>
              <th class="border border-gray-300 p-4">Responsibility Center Code</th>
              <th class="border border-gray-300 p-4">Stock No.</th>
              <th class="border border-gray-300 p-4">Item</th>
              <th class="border border-gray-300 p-4">Unit</th>
              <th class="border border-gray-300 p-4">Quantity Issued</th>
              <th class="border border-gray-300 p-4">Unit Cost</th>
              <th class="border border-gray-300 p-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${this.mockData.items
              .map(
                (item) => `
              <tr>
                <td class="border border-gray-300 p-4">${item.risNo}</td>
                <td class="border border-gray-300 p-4">${item.responsibilityCenterCode}</td>
                <td class="border border-gray-300 p-4">${item.stockNo}</td>
                <td class="border border-gray-300 p-4">${item.item}</td>
                <td class="border border-gray-300 p-4">${item.unit}</td>
                <td class="border border-gray-300 p-4">${item.quantityIssued}</td>
                <td class="border border-gray-300 p-4">${item.unitCost}</td>
                <td class="border border-gray-300 p-4">${item.amount}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <!-- Recapitulation Table -->
        <h2 class="text-2xl font-bold mb-2 mt-4">Recapitulation</h2>
        <table class="w-full border-collapse border border-gray-300 text-2xl">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-4">Stock No.</th>
              <th class="border border-gray-300 p-4">Quantity</th>
              <th class="border border-gray-300 p-4">Unit Cost</th>
              <th class="border border-gray-300 p-4">Total Cost</th>
              <th class="border border-gray-300 p-4">UACS Object Code</th>
            </tr>
          </thead>
          <tbody>
            ${this.mockData.recapitulation
              .map(
                (recap) => `
              <tr>
                <td class="border border-gray-300 p-4">${recap.stockNo}</td>
                <td class="border border-gray-300 p-4">${recap.quantity}</td>
                <td class="border border-gray-300 p-4">${recap.unitCost}</td>
                <td class="border border-gray-300 p-4">${recap.totalCost}</td>
                <td class="border border-gray-300 p-4">${recap.uacsObjectCode}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <!-- Signatures -->
        <div class="mt-6 text-2xl">
          <p><strong>Posted by:</strong> ${this.mockData.postedBy}</p>
          <p class="mt-2">I hereby certify to the correctness of the above information.</p>
          <div class="mt-4">
            <p><strong>Signature over Printed Name of Supply and/or Property Custodian:</strong> ${this.mockData.supplyCustodian}</p>
            <p><strong>Signature over Printed Name of Designated Accounting Staff:</strong> ${this.mockData.accountingStaff}</p>
            <p><strong>Date:</strong> ${this.mockData.dateSigned}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(content);

    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
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

      pdf.save('rsmi-report.pdf');

      document.body.removeChild(content);
    });
  }
}