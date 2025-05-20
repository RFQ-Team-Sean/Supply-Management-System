import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { IcsService, ICS } from 'src/app/services/reports.generation.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-ics',
  standalone: true,
  imports: [
    ButtonModule, 
    TableModule, 
    DialogModule, 
    CardModule, 
    ReactiveFormsModule, 
    CommonModule,
    ToastModule,
    
  ],
  providers: [MessageService],
  templateUrl: './ics.component.html',
  styleUrls: ['./ics.component.scss'],
})
export class IcsComponent implements OnInit {
  icsForm: FormGroup;
  displayDialog: boolean = false;
  editingIndex: number = -1;
  loading: boolean = true;
  icsReports: ICS[] = [];

  constructor(
    private fb: FormBuilder,
    private icsService: IcsService,
    private messageService: MessageService
  ) {
    this.icsForm = this.fb.group({
      entityName: ['', Validators.required],
      fundCluster: [''],
      icsNo: [''],
      date: ['', Validators.required],
      inventoryItemNo: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      unitCost: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      estimatedUsefulLife: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadIcsReports();
  }

  loadIcsReports() {
    this.loading = true;
    this.icsService.getAllIcs().subscribe({
      next: (data: ICS[]) => {
        console.log('Received ICS data:', data);
        this.icsReports = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading ICS reports:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ICS reports: ' + error.message
        });
        this.loading = false;
      }
    });
  }

  private generateIcsNumber(): string {
    const year = new Date().getFullYear();
    const existingNumbers = this.icsReports
      .map(ics => ics.ics_no)
      .filter(no => no.startsWith(`ICS-${year}`))
      .map(no => parseInt(no.split('-')[2]));
    
    const nextNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1 
      : 1;
    
    return `ICS-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  private generateFundCluster(): string {
    const year = new Date().getFullYear();
    const existingNumbers = this.icsReports
      .map(ics => ics.fund_cluster)
      .filter(fc => fc.startsWith(`FC-${year}`))
      .map(fc => parseInt(fc.split('-')[2]));
    
    const nextNumber = existingNumbers.length > 0 
      ? Math.max(...existingNumbers) + 1 
      : 1;
    
    return `FC-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  showDialog() {
    this.displayDialog = true;
    this.editingIndex = -1;
    this.icsForm.reset();
    
    // Auto-generate numbers for new entries
    this.icsForm.patchValue({
      icsNo: this.generateIcsNumber(),
      fundCluster: this.generateFundCluster()
    });
  }

  editICS(ics: ICS) {
    this.editingIndex = this.icsReports.indexOf(ics);
    this.icsForm.patchValue({
      entityName: ics.entity_name,
      fundCluster: ics.fund_cluster,
      icsNo: ics.ics_no,
      date: new Date(ics.date).toISOString().split('T')[0],
      inventoryItemNo: ics.inventory_item_no,
      quantity: ics.quantity,
      unit: ics.unit,
      unitCost: ics.unit_cost,
      description: ics.description,
      estimatedUsefulLife: ics.estimated_useful_life
    });
    
    // Disable form controls for auto-generated fields during edit
    this.icsForm.get('icsNo')?.disable();
    this.icsForm.get('fundCluster')?.disable();
    
    this.displayDialog = true;
  }

  deleteICS(ics: ICS) {
    this.icsService.deleteIcs(ics.ics_no).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'ICS deleted successfully'
        });
        this.loadIcsReports();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete ICS'
        });
      }
    });
  }

  saveICS() {
    if (this.icsForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill out all required fields.'
      });
      return;
    }

    const formData = {
      ics_no: this.icsForm.get('icsNo')?.value || this.generateIcsNumber(),
      entity_name: this.icsForm.value.entityName,
      fund_cluster: this.icsForm.get('fundCluster')?.value || this.generateFundCluster(),
      date: new Date(this.icsForm.value.date),
      inventory_item_no: this.icsForm.value.inventoryItemNo,
      quantity: this.icsForm.value.quantity,
      unit: this.icsForm.value.unit,
      unit_cost: this.icsForm.value.unitCost,
      description: this.icsForm.value.description,
      estimated_useful_life: this.icsForm.value.estimatedUsefulLife
    };

    if (this.editingIndex === -1) {
      // Create new ICS
      this.icsService.createIcs(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'ICS created successfully'
          });
          this.loadIcsReports();
          this.displayDialog = false;
          this.icsForm.reset();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create ICS'
          });
        }
      });
    } else {
      // Update existing ICS
      const id = this.icsReports[this.editingIndex].ics_no;
      this.icsService.updateIcs(id, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'ICS updated successfully'
          });
          this.loadIcsReports();
          this.displayDialog = false;
          this.icsForm.reset();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update ICS'
          });
        }
      });
    }
  }

  exportPdf() {
    if (this.icsForm.invalid) {
      alert('Please fill out all required fields before exporting to PDF.');
      return;
    }

    const formValues = this.icsForm.value;
    const totalCost = formValues.quantity * formValues.unitCost;

    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-8 bg-white shadow-lg rounded-lg">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800">INVENTORY CUSTODIAN SLIP</h1>
          <h2 class="text-xl text-gray-600">Department of Education</h2>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div class="border p-3 rounded">
            <p class="font-semibold">Entity Name: <span class="font-normal">${formValues.entityName}</span></p>
            <p class="font-semibold mt-2">Fund Cluster: <span class="font-normal">${formValues.fundCluster}</span></p>
          </div>
          <div class="border p-3 rounded">
            <p class="font-semibold">ICS No.: <span class="font-normal">${formValues.icsNo}</span></p>
            <p class="font-semibold mt-2">Date: <span class="font-normal">${formValues.date}</span></p>
          </div>
        </div>

        <table class="w-full border-collapse border border-gray-300 text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 border">Description</th>
              <th class="p-3 border">Inventory Item No.</th>
              <th class="p-3 border">Quantity</th>
              <th class="p-3 border">Unit</th>
              <th class="p-3 border">Unit Cost</th>
              <th class="p-3 border">Total Cost</th>
              <th class="p-3 border">Estimated Useful Life</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-3 border">${formValues.description}</td>
              <td class="p-3 border">${formValues.inventoryItemNo}</td>
              <td class="p-3 border text-right">${formValues.quantity}</td>
              <td class="p-3 border">${formValues.unit}</td>
              <td class="p-3 border text-right">₱${formValues.unitCost.toLocaleString()}</td>
              <td class="p-3 border text-right">₱${totalCost.toLocaleString()}</td>
              <td class="p-3 border">${formValues.estimatedUsefulLife}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 text-sm space-y-2">
          <p class="font-semibold">Certified Correct:</p>
          <div class="border-t-2 pt-2">
            <p class="mb-4">Signature over Printed Name of Supply/Property Custodian</p>
            <p>Date: _________________________</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(content);

    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('ics-report.pdf');
      document.body.removeChild(content);
    });
  }
}