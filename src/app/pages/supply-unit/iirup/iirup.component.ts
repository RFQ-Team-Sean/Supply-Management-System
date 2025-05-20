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
import { DropdownModule } from 'primeng/dropdown';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportsGenerationService } from '../../../services/reports.generation.service';
import { IIRUP, IIRUPItem } from '../../../schema/schema';
import { DepartmentService, Department } from '../../../services/departments.service';

@Component({
    selector: 'app-iirup',
    templateUrl: './iirup.component.html',
    styleUrls: ['./iirup.component.scss'],
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
        DropdownModule,
        ToastModule
    ]
})
export class IIRUPComponent implements OnInit {
    iirupReports: IIRUP[] = [];
    displayDialog: boolean = false;
    displayItemDialog: boolean = false;
    iirupForm: FormGroup;
    editingIndex: number = -1;
    editingItemIndex: number = -1;
    itemsForm: FormGroup;
    departments: Department[] = [];

    constructor(
        private fb: FormBuilder,
        private reportsService: ReportsGenerationService,
        private departmentService: DepartmentService,
        private messageService: MessageService
    ) {
        this.iirupForm = this.fb.group({
            iirupNo: ['', Validators.required],
            entityName: ['', Validators.required],
            fundCluster: ['', Validators.required],
            department: ['', Validators.required],
            accountableOfficer: ['', Validators.required],
            designation: ['', Validators.required],
            date: ['', Validators.required],
            items: this.fb.array([]),
            totalValue: [0, [Validators.required, Validators.min(0)]],
            disposalType: ['', Validators.required],
            remarks: ['']
        });

        this.itemsForm = this.fb.group({
            dateAcquired: ['', Validators.required],
            article: ['', Validators.required],
            propertyNo: ['', Validators.required],
            quantity: [0, [Validators.required, Validators.min(0)]],
            unitCost: [0, [Validators.required, Validators.min(0)]],
            totalCost: [0],
            remarks: [''],
            disposalType: ['', Validators.required],
            appraisedValue: [0, [Validators.required, Validators.min(0)]],
            salesAmount: [0, [Validators.min(0)]]
        });

        // Add value change subscriptions to calculate totalCost
        this.itemsForm.get('quantity')?.valueChanges.subscribe(() => this.calculateItemTotal());
        this.itemsForm.get('unitCost')?.valueChanges.subscribe(() => this.calculateItemTotal());
    }

    async ngOnInit() {
        await this.loadIIRUPs();
        await this.loadDepartments();
    }

    async loadIIRUPs() {
        this.iirupReports = await this.reportsService.getAllIIRUP();
    }

    async loadDepartments() {
        this.departments = await this.departmentService.getAllDepartments();
    }

    showDialog() {
        this.editingIndex = -1;
        this.iirupForm.reset();
        this.iirupForm.patchValue({
            iirupNo: `IIRUP-${new Date().getFullYear()}-${String(this.iirupReports.length + 1).padStart(3, '0')}`,
            date: new Date(),
            items: [],
            totalValue: 0,
            status: 'draft'
        });
        this.displayDialog = true;
    }

    async editIIRUP(iirup: IIRUP) {
        const fullIIRUP = await this.reportsService.getIIRUP(iirup.id);
        if (fullIIRUP) {
            this.editingIndex = this.iirupReports.findIndex(r => r.id === iirup.id);
            this.iirupForm.patchValue({
                iirupNo: fullIIRUP.iirupNo,
                entityName: fullIIRUP.entityName,
                fundCluster: fullIIRUP.fundCluster,
                department: fullIIRUP.department,
                accountableOfficer: fullIIRUP.accountableOfficer,
                designation: fullIIRUP.designation,
                date: fullIIRUP.date,
                totalValue: fullIIRUP.totalValue,
                disposalType: fullIIRUP.disposalType,
                remarks: fullIIRUP.remarks
            });

            // Clear existing items
            const itemsArray = this.iirupForm.get('items') as FormArray;
            itemsArray.clear();

            // Add all items
            fullIIRUP.items.forEach(item => {
                itemsArray.push(this.fb.group(item));
            });

            this.displayDialog = true;
        }
    }

    async deleteIIRUP(iirup: IIRUP) {
        try {
            await this.reportsService.deleteIIRUP(iirup.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'IIRUP report deleted successfully'
            });
            await this.loadIIRUPs();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete IIRUP report'
            });
            console.error('Error deleting IIRUP:', error);
        }
    }

    async saveIIRUP() {
        if (this.iirupForm.valid) {
            try {
                const iirupData = {
                    ...this.iirupForm.value,
                    status: 'draft',
                    items: (this.iirupForm.get('items') as FormArray).value
                };

                if (this.editingIndex === -1) {
                    await this.reportsService.createIIRUP(iirupData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'IIRUP report created successfully'
                    });
                } else {
                    const existingIIRUP = this.iirupReports[this.editingIndex];
                    await this.reportsService.updateIIRUP(existingIIRUP.id, iirupData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'IIRUP report updated successfully'
                    });
                }

                await this.loadIIRUPs();
                this.displayDialog = false;
                this.iirupForm.reset();
            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save IIRUP report'
                });
                console.error('Error saving IIRUP:', error);
            }
        }
    }

    showItemDialog() {
        this.editingItemIndex = -1;
        this.itemsForm.reset({
            dateAcquired: new Date(),
            quantity: 0,
            unitCost: 0,
            totalCost: 0,
            appraisedValue: 0,
            salesAmount: 0
        });
        this.displayItemDialog = true;
    }

    editItem(index: number) {
        this.editingItemIndex = index;
        const itemsArray = this.iirupForm.get('items') as FormArray;
        this.itemsForm.patchValue(itemsArray.at(index).value);
        this.displayItemDialog = true;
    }

    deleteItem(index: number) {
        const itemsArray = this.iirupForm.get('items') as FormArray;
        itemsArray.removeAt(index);
        this.updateTotalValue();
    }

    saveItem() {
        if (this.itemsForm.valid) {
            const itemsArray = this.iirupForm.get('items') as FormArray;
            
            // Calculate final values before saving
            this.calculateItemTotal();
            
            if (this.editingItemIndex === -1) {
                // Add new item
                itemsArray.push(this.fb.group(this.itemsForm.value));
            } else {
                // Update existing item
                itemsArray.at(this.editingItemIndex).patchValue(this.itemsForm.value);
            }
            
            this.displayItemDialog = false;
            this.itemsForm.reset();
            this.updateTotalValue();
        }
    }

    private calculateItemTotal() {
        const quantity = this.itemsForm.get('quantity')?.value || 0;
        const unitCost = this.itemsForm.get('unitCost')?.value || 0;
        this.itemsForm.patchValue({ totalCost: quantity * unitCost }, { emitEvent: false });
    }

    private updateTotalValue() {
        const itemsArray = this.iirupForm.get('items') as FormArray;
        const total = itemsArray.controls.reduce((sum, control) => {
            return sum + (control.get('totalCost')?.value || 0);
        }, 0);
        this.iirupForm.patchValue({ totalValue: total }, { emitEvent: false });
    }

    exportPdf() {
        const doc = new jsPDF();
        const report = this.iirupForm.value;
        
        // Set title
        doc.setFontSize(12);
        doc.text('INVENTORY AND INSPECTION REPORT OF UNSERVICEABLE PROPERTY', doc.internal.pageSize.width / 2, 15, { align: 'center' });
        
        // Add header section with proper spacing and alignment
        doc.setFontSize(10);
        
        // Entity and Fund Cluster (top row)
        doc.text('Entity Name:', 15, 25);
        doc.line(40, 25, 120, 25); // Line for Entity Name
        doc.text('Fund Cluster:', 140, 25);
        doc.line(165, 25, 195, 25); // Line for Fund Cluster
        
        // Add "As at" line
        doc.text('As at ________________', doc.internal.pageSize.width / 2, 35, { align: 'center' });
        
        // Create table with proper styling
        const headers = [
            [
                { content: 'INVENTORY', colSpan: 6, styles: { halign: 'center' as const, fontSize: 7 } },
                { content: 'INSPECTION and DISPOSAL', colSpan: 7, styles: { halign: 'center' as const, fontSize: 7 } }
            ],
            [
                'Date',
                'Article',
                'Property No.',
                'Qty',
                'Unit Cost',
                'Total Cost',
                'Remarks',
                { content: 'DISPOSAL', colSpan: 4, styles: { halign: 'center' as const, fontSize: 7 } },
                'Appraised Value',
                'Sales Amount'
            ],
            [
                '', '', '', '', '', '', '',
                { content: 'Sale', styles: { fontSize: 5 } },
                { content: 'Transfer', styles: { fontSize: 5 } },
                { content: 'Destruction', styles: { fontSize: 5 } },
                { content: 'Others', styles: { fontSize: 5 } },
                '', ''
            ]
        ];
        
        // Sample data
        const data = [
            ['2023-01-15', 'Desktop Computer', 'PC-2023-001', '1', '45,000', '45,000', 'Beyond repair', '✓', '', '', '', '5,000', '4,500'],
            ['2023-02-20', 'Office Chair', 'FUR-2023-005', '2', '2,500', '5,000', 'Broken', '', '✓', '', '', '500', '-'],
            ['2023-03-10', 'Printer', 'PR-2023-002', '1', '15,000', '15,000', 'Not working', '', '', '✓', '', '1,000', '-'],
            ['2023-04-05', 'Filing Cabinet', 'FC-2023-003', '1', '8,000', '8,000', 'Rusty', '', '', '', '✓', '800', '-']
        ];
        
        autoTable(doc, {
            startY: 45,
            head: headers,
            body: data,
            theme: 'grid',
            styles: {
                fontSize: 6.5,
                cellPadding: 1,
                lineWidth: 0.1,
                valign: 'middle',
                halign: 'center'
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                fontSize: 7
            },
            columnStyles: {
                0: { cellWidth: 15 },  // Date
                1: { cellWidth: 20 },  // Article
                2: { cellWidth: 18 },  // Property No
                3: { cellWidth: 8 },   // Qty
                4: { cellWidth: 15 },  // Unit Cost
                5: { cellWidth: 15 },  // Total Cost
                6: { cellWidth: 20 },  // Remarks
                7: { cellWidth: 10 },  // Sale
                8: { cellWidth: 10 },  // Transfer
                9: { cellWidth: 12 },  // Destruction
                10: { cellWidth: 10 }, // Others
                11: { cellWidth: 15 }, // Appraised Value
                12: { cellWidth: 15 }  // Sales Amount
            }
        });
        
        // Add certification text and signature lines
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Left certification text
        doc.setFontSize(7);
        doc.text('I HEREBY request inspection and disposition,', 15, finalY);
        doc.text('pursuant to Section 79 of PD 1445, of the', 15, finalY + 4);
        doc.text('property enumerated above.', 15, finalY + 8);
        
        // Middle certification text
        doc.text('I CERTIFY that I have inspected each', doc.internal.pageSize.width / 2 - 20, finalY);
        doc.text('and every article enumerated in this', doc.internal.pageSize.width / 2 - 20, finalY + 4);
        doc.text('report and that the disposition made', doc.internal.pageSize.width / 2 - 20, finalY + 8);
        doc.text('thereof is, in my judgment, the best for', doc.internal.pageSize.width / 2 - 20, finalY + 12);
        doc.text('the public interest.', doc.internal.pageSize.width / 2 - 20, finalY + 16);
        
        // Right certification text
        doc.text('I CERTIFY that I have', doc.internal.pageSize.width - 50, finalY);
        doc.text('witnessed the disposition of the', doc.internal.pageSize.width - 50, finalY + 4);
        doc.text('articles enumerated in this', doc.internal.pageSize.width - 50, finalY + 8);
        doc.text('report this ___ day of ___', doc.internal.pageSize.width - 50, finalY + 12);
        
        // Signature section
        const signY = finalY + 25;
        
        // Add signature lines with proper spacing
        const signatureWidth = 45;
        const startX = 15;
        const spacing = (180 - signatureWidth * 3) / 2;
        
        // Draw signature lines and labels
        [
            { label: 'Requested by:', x: startX },
            { label: 'Approved by:', x: startX + signatureWidth + spacing },
            { label: 'Witnessed by:', x: startX + (signatureWidth + spacing) * 2 }
        ].forEach(({ label, x }) => {
            // Label above line
            doc.setFontSize(7);
            doc.text(label, x, signY);
            
            // Signature line
            doc.line(x, signY + 10, x + signatureWidth, signY + 10);
            
            // Labels below line
            doc.text('(Signature over Printed Name)', x, signY + 15);
            doc.text('Position/Designation', x, signY + 20);
            doc.text('Date', x, signY + 25);
        });
        
        // Save the PDF
        doc.save(`IIRUP-${report.iirupNo}.pdf`);
    }
} 