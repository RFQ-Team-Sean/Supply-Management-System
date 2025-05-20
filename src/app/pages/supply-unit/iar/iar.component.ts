import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportsGenerationService, IAR } from 'src/app/services/reports.generation.service';

@Component({
  selector: 'app-iar',
  standalone: true,
  imports: [ButtonModule, TableModule, DialogModule, CardModule, ReactiveFormsModule, CommonModule],
  templateUrl: './iar.component.html',
  styleUrls: ['./iar.component.scss'],
})
export class IarComponent implements OnInit {
  iarForm: FormGroup;
  displayDialog: boolean = false;
  editingIndex: number = -1;
  iarReports: IAR[] = [];
  loading: boolean = true;

  constructor(private fb: FormBuilder, private iarService: ReportsGenerationService) {
    this.iarForm = this.fb.group({
      iarNo: ['', Validators.required],
      poNo: ['', Validators.required],
      supplier: ['', Validators.required],
      date: ['', Validators.required],
      invoiceNo: ['', Validators.required],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      status: ['', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.loadIarReports();
  }

  loadIarReports() {
    this.loading = true;
    this.iarService.getAllIar().subscribe({
      next: (data: IAR[]) => {
        console.log('Received IAR data:', data);
        this.iarReports = data.map(iar => ({
          id: iar.id,
          iar_no: iar.iar_no,
          po_no: iar.po_no,
          supplier: iar.supplier,
          date: iar.date,
          invoice_no: iar.invoice_no,
          total_amount: iar.total_amount,
          status: iar.status,
          remarks: iar.remarks
        }));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading IAR reports:', error);
        this.loading = false;
      }
    });
  }

  private generateIarNumber(): string {
    const year = new Date().getFullYear();
    const existingNumbers = this.iarReports
        .map(iar => iar.iar_no)
        .filter(no => no.startsWith(`IAR-${year}`))
        .map(no => parseInt(no.split('-')[2]));
    const nextNumber = existingNumbers.length > 0 
        ? Math.max(...existingNumbers) + 1 
        : 1;
    return `IAR-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  private generatePoNumber(): string {
    const year = new Date().getFullYear();
    const existingNumbers = this.iarReports
        .map(iar => iar.po_no)
        .filter(no => no.startsWith(`PO-${year}`))
        .map(no => parseInt(no.split('-')[2]));
    const nextNumber = existingNumbers.length > 0 
        ? Math.max(...existingNumbers) + 1 
        : 1;
    return `PO-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  showDialog() {
    this.displayDialog = true;
    this.editingIndex = -1;
    this.iarForm.reset();
    this.iarForm.patchValue({
        iarNo: this.generateIarNumber(),
        poNo: this.generatePoNumber()
    });
  }

  editIAR(iar: IAR) {
    this.editingIndex = this.iarReports.indexOf(iar);
    this.iarForm.patchValue({
        iarNo: iar.iar_no,
        poNo: iar.po_no,
        supplier: iar.supplier,
        date: new Date(iar.date),
        invoiceNo: iar.invoice_no,
        totalAmount: iar.total_amount,
        status: iar.status,
        remarks: iar.remarks
    });
    this.iarForm.get('iarNo')?.disable();
    this.iarForm.get('poNo')?.disable();
    this.displayDialog = true;
  }

  deleteIAR(iar: IAR) {
    this.iarService.deleteIar(iar.id).subscribe({
      next: () => {
        this.loadIarReports();
      },
      error: (error) => {
        console.error('Error deleting IAR:', error);
      }
    });
  }

  saveIAR() {
    if (this.iarForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }
    const iarData: IAR = this.iarForm.value;
    if (this.editingIndex === -1) {
        iarData.iar_no = this.generateIarNumber();
        iarData.po_no = this.generatePoNumber();
        this.iarService.createIar(iarData).subscribe({
            next: () => {
                this.loadIarReports();
                this.displayDialog = false;
                this.iarForm.reset();
            },
            error: (error) => {
                console.error('Error creating IAR:', error);
            }
        });
    } else {
        const updatedIarData = {
            id: this.iarReports[this.editingIndex].id,
            iar_no: this.iarForm.get('iarNo')?.value,
            po_no: this.iarForm.get('poNo')?.value,
            supplier: this.iarForm.get('supplier')?.value,
            date: this.iarForm.get('date')?.value,
            invoice_no: this.iarForm.get('invoiceNo')?.value,
            total_amount: this.iarForm.get('totalAmount')?.value,
            status: this.iarForm.get('status')?.value,
            remarks: this.iarForm.get('remarks')?.value
        };
        this.iarService.updateIar(updatedIarData.id, updatedIarData).subscribe({
            next: () => {
                this.loadIarReports();
                this.displayDialog = false;
                this.iarForm.reset();
            },
            error: (error) => {
                console.error('Error updating IAR:', error);
            }
        });
    }
  }

  exportPdf() {
    const content = document.createElement('div');
    const formValues = this.iarForm.value;
  
    // Set styles for PDF generation
    content.style.backgroundColor = '#ffffff';
    content.style.padding = '0';
    content.style.width = '100%';
    content.style.maxWidth = '800px';
    content.style.margin = '0 auto';
  
    content.innerHTML = `
      <div style="background-color: white; padding: 10px; width: 100%;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-family: Arial, sans-serif; font-size: 11px;">
          <!-- Header -->
          <tr>
            <th colspan="4" style="text-align: center; font-weight: bold; border: 1px solid black; padding: 8px; background-color: white;">INSPECTION AND ACCEPTANCE REPORT</th>
          </tr>
          
          <!-- Entity Name and Fund Cluster -->
          <tr>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">Entity Name: ${formValues.entityName || '_________________________'}</td>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">Fund Cluster: ${formValues.fundCluster || '_________________________'}</td>
          </tr>
          
          <!-- Supplier row -->
          <tr>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">Supplier: ${formValues.supplier || '_________________________'}</td>
            <td style="border: 1px solid black; padding: 6px;">PO No.: ${formValues.poNo || '_________________'}</td>
            <td style="border: 1px solid black; padding: 6px;">Date: ${formValues.date || '_________________'}</td>
          </tr>
          
          <!-- PO/Date row -->
          <tr>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">P.O./Date: ${formValues.poDate || '_________________________'}</td>
            <td style="border: 1px solid black; padding: 6px;">IAR No.: ${formValues.iarNo || '_________________'}</td>
            <td style="border: 1px solid black; padding: 6px;">Date: ${formValues.iarDate || '_________________'}</td>
          </tr>
          
          <!-- Requisitioning Office row -->
          <tr>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">Requisitioning Office/Dept.: ${formValues.requisitioningOffice || '_____________________'}</td>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">Date: ${formValues.reqDate || '_________________'}</td>
          </tr>
          
          <!-- Items header -->
          <tr>
            <th style="border: 1px solid black; padding: 6px; text-align: center; font-weight: bold; width: 25%; background-color: white;">Property</th>
            <th style="border: 1px solid black; padding: 6px; text-align: center; font-weight: bold; width: 45%; background-color: white;">Description</th>
            <th style="border: 1px solid black; padding: 6px; text-align: center; font-weight: bold; width: 15%; background-color: white;">Unit</th>
            <th style="border: 1px solid black; padding: 6px; text-align: center; font-weight: bold; width: 15%; background-color: white;">Quantity</th>
          </tr>
          
          <!-- Item rows - Dynamically generate based on items array -->
          ${this.generateItemRows(formValues.items)}
          
          <!-- Inspection and Acceptance headers -->
          <tr>
            <th colspan="2" style="border: 1px solid black; padding: 6px; text-align: center; font-weight: bold; background-color: white;">INSPECTION</th>
            <th colspan="2" style="border: 1px solid black; padding: 6px; text-align: center; font-weight: bold; background-color: white;">ACCEPTANCE</th>
          </tr>
          
          <!-- Date Inspected/Received row -->
          <tr>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">Date Inspected: ${formValues.dateInspected || '_______________________'}</td>
            <td colspan="2" style="border: 1px solid black; padding: 6px;">Date Received: ${formValues.dateReceived || '_______________________'}</td>
          </tr>
          
          <!-- Checkbox rows -->
          <tr>
            <td colspan="2" style="border: 1px solid black; padding: 6px; vertical-align: top; height: 80px;">
              <div style="margin-top: 10px;">
                <input type="checkbox" style="margin-right: 5px;" ${formValues.isVerified ? 'checked' : ''}>
                <span>Inspected, verified and found in order as to</span>
                <br>
                <span style="margin-left: 20px;">quantity and specifications</span>
              </div>
            </td>
            <td colspan="2" style="border: 1px solid black; padding: 6px; vertical-align: top;">
              <div style="margin-top: 10px;">
                <input type="checkbox" style="margin-right: 5px;" ${formValues.isComplete ? 'checked' : ''}>
                <span>Complete</span>
                <br>
                <input type="checkbox" style="margin-right: 5px; margin-top: 10px;" ${formValues.isPartial ? 'checked' : ''}>
                <span>Partial (pls. specify quantity)</span>
                ${formValues.isPartial && formValues.partialQuantity ? '<br><span style="margin-left: 20px;">' + formValues.partialQuantity + '</span>' : ''}
              </div>
            </td>
          </tr>
          
          <!-- Signature lines -->
          <tr>
            <td colspan="2" style="border: 1px solid black; padding: 6px; text-align: center; height: 60px;">
              <div style="margin-top: 30px; padding-top: 5px; border-top: 1px solid black;">
                <p style="margin: 0;">Inspection Officer/Inspection Committee</p>
              </div>
            </td>
            <td colspan="2" style="border: 1px solid black; padding: 6px; text-align: center;">
              <div style="margin-top: 30px; padding-top: 5px; border-top: 1px solid black;">
                <p style="margin: 0;">Supply and/or Property Custodian</p>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  
    document.body.appendChild(content);
  
    html2canvas(content, {
      backgroundColor: '#ffffff',
      scale: 2 // Increased resolution for better quality
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add some margins
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('iar-report.pdf');
      document.body.removeChild(content);
    });
  }
  
  // Helper function to generate item rows
  private generateItemRows(items: any[]): string {
    if (!items || items.length === 0) {
      // Generate 12 empty rows if no items
      let rows = '';
      for (let i = 0; i < 12; i++) {
        rows += `<tr>
          <td style="border: 1px solid black; padding: 6px; height: 25px;"></td>
          <td style="border: 1px solid black; padding: 6px;"></td>
          <td style="border: 1px solid black; padding: 6px;"></td>
          <td style="border: 1px solid black; padding: 6px;"></td>
        </tr>`;
      }
      return rows;
    }
  
    // Generate rows with item data
    let rows = '';
    items.forEach(item => {
      rows += `<tr>
        <td style="border: 1px solid black; padding: 6px; height: 25px;">${item.property || ''}</td>
        <td style="border: 1px solid black; padding: 6px;">${item.description || ''}</td>
        <td style="border: 1px solid black; padding: 6px;">${item.unit || ''}</td>
        <td style="border: 1px solid black; padding: 6px;">${item.quantity || ''}</td>
      </tr>`;
    });
  
    // Add empty rows if less than 12 items
    const remainingRows = 12 - items.length;
    if (remainingRows > 0) {
      for (let i = 0; i < remainingRows; i++) {
        rows += `<tr>
          <td style="border: 1px solid black; padding: 6px; height: 25px;"></td>
          <td style="border: 1px solid black; padding: 6px;"></td>
          <td style="border: 1px solid black; padding: 6px;"></td>
          <td style="border: 1px solid black; padding: 6px;"></td>
        </tr>`;
      }
    }
  
    return rows;
  }
}