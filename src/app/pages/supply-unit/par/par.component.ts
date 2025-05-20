import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { ReportsGenerationService } from '../../../services/reports.generation.service';
import { PAR, PARItem } from '../../../schema/schema';

@Component({
    selector: 'app-par',
    templateUrl: './par.component.html',
    styleUrls: ['./par.component.scss'],
    providers: [MessageService],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        TableModule,
        DialogModule,
        InputTextModule,
        ToastModule
    ]
})
export class ParComponent implements OnInit {
    parReports: PAR[] = [];
    displayDialog: boolean = false;
    displayItemDialog: boolean = false;
    parForm: FormGroup;
    itemsForm: FormGroup;
    editingIndex: number = -1;
    editingItemIndex: number = -1;

    constructor(
        private fb: FormBuilder,
        private reportsService: ReportsGenerationService,
        private messageService: MessageService
    ) {
        this.initializeForms();
    }

    private initializeForms() {
        this.parForm = this.fb.group({
            parNo: ['', Validators.required],
            entityName: ['', Validators.required],
            fundCluster: ['', Validators.required],
            receivedBy: ['', Validators.required],
            receivedFrom: ['', Validators.required],
            date: ['', Validators.required],
            items: this.fb.array([])
        });

        this.itemsForm = this.fb.group({
            propertyNo: ['', Validators.required],
            description: ['', Validators.required],
            quantity: [0, [Validators.required, Validators.min(1)]],
            unit: ['', Validators.required]
        });
    }

    async ngOnInit() {
        await this.loadPARs();
    }

    async loadPARs() {
        this.parReports = await this.reportsService.getAllPAR();
    }

    showDialog() {
        this.editingIndex = -1;
        this.parForm.reset();
        this.parForm.patchValue({
            parNo: `PAR-${new Date().getFullYear()}-${String(this.parReports.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            items: []
        });
        this.displayDialog = true;
    }

    showItemDialog() {
        this.editingItemIndex = -1;
        this.itemsForm.reset();
        this.displayItemDialog = true;
    }

    async editPAR(par: PAR) {
        const fullPAR = await this.reportsService.getPAR(par.id);
        if (fullPAR) {
            this.editingIndex = this.parReports.findIndex(r => r.id === par.id);
            this.parForm.patchValue({
                parNo: fullPAR.parNo,
                entityName: fullPAR.entityName,
                fundCluster: fullPAR.fundCluster,
                receivedBy: fullPAR.receivedBy,
                receivedFrom: fullPAR.receivedFrom,
                date: new Date(fullPAR.date).toISOString().split('T')[0]
            });

            // Clear existing items
            const itemsArray = this.parForm.get('items') as FormArray;
            itemsArray.clear();

            // Add all items
            fullPAR.items.forEach((item: PARItem) => {
                itemsArray.push(this.fb.group(item));
            });

            this.displayDialog = true;
        }
    }

    editItem(index: number) {
        this.editingItemIndex = index;
        const itemsArray = this.parForm.get('items') as FormArray;
        const item = itemsArray.at(index);
        this.itemsForm.patchValue(item.value);
        this.displayItemDialog = true;
    }

    saveItem() {
        if (this.itemsForm.valid) {
            const itemsArray = this.parForm.get('items') as FormArray;
            if (this.editingItemIndex === -1) {
                itemsArray.push(this.fb.group(this.itemsForm.value));
            } else {
                itemsArray.at(this.editingItemIndex).patchValue(this.itemsForm.value);
            }
            this.displayItemDialog = false;
            this.itemsForm.reset();
        }
    }

    removeItem(index: number) {
        const itemsArray = this.parForm.get('items') as FormArray;
        itemsArray.removeAt(index);
    }

    async savePAR() {
        if (this.parForm.valid) {
            try {
                const parData = {
                    ...this.parForm.value,
                    status: 'draft'
                };

                if (this.editingIndex === -1) {
                    await this.reportsService.createPAR(parData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'PAR created successfully'
                    });
                } else {
                    const existingPAR = this.parReports[this.editingIndex];
                    await this.reportsService.updatePAR(existingPAR.id, parData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'PAR updated successfully'
                    });
                }

                await this.loadPARs();
                this.displayDialog = false;
                this.parForm.reset();
            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save PAR'
                });
                console.error('Error saving PAR:', error);
            }
        }
    }

    async deletePAR(par: PAR) {
        try {
            await this.reportsService.deletePAR(par.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'PAR deleted successfully'
            });
            await this.loadPARs();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete PAR'
            });
            console.error('Error deleting PAR:', error);
        }
    }

    exportPdf() {
        if (this.parForm.invalid) {
            alert('Please fill out all fields in the form.');
            return;
        }

        const formValues = this.parForm.value;

        const content = document.createElement('div');
        content.innerHTML = `
          <div class="p-10 bg-white shadow-md rounded-lg">
            <h1 class="text-4xl font-bold mb-4 flex justify-center">PROPERTY ACKNOWLEDGEMENT RECEIPT</h1>
            
            <!-- Entity Name, Fund Cluster, PAR No., and Date -->
            <div class="mb-4 text-2xl">
              <div class="flex flex-row justify-between">
                <p><strong>Entity Name:</strong> ${formValues.entityName}</p>
                <p><strong>Fund Cluster:</strong> ${formValues.fundCluster}</p>
              </div>
              <div class="flex flex-row justify-between">
                <p><strong>PAR No.:</strong> ${formValues.parNo}</p>
                <p><strong>Date:</strong> ${formValues.date}</p>
              </div>
            </div>

            <!-- Items Table -->
            <h2 class="text-2xl font-bold mb-2">Items</h2>
            <table class="w-full border-collapse border border-gray-300 text-2xl">
              <thead>
                <tr class="bg-gray-200">
                  <th class="border border-gray-300 p-4">Quantity</th>
                  <th class="border border-gray-300 p-4">Unit</th>
                  <th class="border border-gray-300 p-4">Description</th>
                  <th class="border border-gray-300 p-4">Property No.</th>
                </tr>
              </thead>
              <tbody>
                ${this.parReports
                  .map(
                    (par) => `
                  <tr>
                    <td class="border border-gray-300 p-4">${par.items.length}</td>
                    <td class="border border-gray-300 p-4">${par.fundCluster}</td>
                    <td class="border border-gray-300 p-4">${par.entityName}</td>
                    <td class="border border-gray-300 p-4">${par.parNo}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <!-- Signatures -->
            <div class="mt-6 text-2xl">
              <p><strong>Received by:</strong> ${formValues.receivedBy}</p>
              <p><strong>Received from:</strong> ${formValues.receivedFrom}</p>
              <p><strong>Date:</strong> ${formValues.date}</p>
            </div>
          </div>
        `;

        document.body.appendChild(content);

        html2canvas(content).then((canvas: HTMLCanvasElement) => {
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

            pdf.save('par-report.pdf');

            document.body.removeChild(content);
        });
    }
}