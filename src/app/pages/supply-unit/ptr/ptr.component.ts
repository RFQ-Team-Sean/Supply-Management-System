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
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportsGenerationService } from '../../../services/reports.generation.service';
import { DepartmentService, Department } from '../../../services/departments.service';
import { PTR, PTRItem } from '../../../schema/schema';

@Component({
    selector: 'app-ptr',
    templateUrl: './ptr.component.html',
    styleUrls: ['./ptr.component.scss'],
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
export class PTRComponent implements OnInit {
    ptrReports: PTR[] = [];
    departments: Department[] = [];
    displayDialog: boolean = false;
    displayItemDialog: boolean = false;
    ptrForm: FormGroup;
    editingIndex: number = -1;
    itemsForm: FormGroup;

    transferTypes = [
        { label: 'Donation', value: 'Donation' },
        { label: 'Relocate', value: 'Relocate' },
        { label: 'Reassignment', value: 'Reassignment' },
        { label: 'Others', value: 'Others' }
    ];

    constructor(
        private fb: FormBuilder,
        private reportsService: ReportsGenerationService,
        private departmentService: DepartmentService,
        private messageService: MessageService
    ) {
        this.initializeForms();
    }

    private initializeForms() {
        this.ptrForm = this.fb.group({
            ptrNo: ['', Validators.required],
            entityName: ['', Validators.required],
            fundCluster: ['', Validators.required],
            fromOfficer: ['', Validators.required],
            fromDepartment: ['', Validators.required],
            fromFundCluster: ['', Validators.required],
            toOfficer: ['', Validators.required],
            toDepartment: ['', Validators.required],
            toFundCluster: ['', Validators.required],
            date: ['', Validators.required],
            transferType: ['', Validators.required],
            otherTransferType: [''],
            items: this.fb.array([]),
            totalValue: [0, [Validators.required, Validators.min(0)]],
            transferReason: ['', Validators.required],
            remarks: ['']
        });

        this.itemsForm = this.fb.group({
            dateAcquired: ['', Validators.required],
            propertyNo: ['', Validators.required],
            description: ['', Validators.required],
            amount: [0, [Validators.required, Validators.min(0)]],
            condition: ['', Validators.required]
        });
    }

    async ngOnInit() {
        await this.loadPTRs();
        await this.loadDepartments();
    }

    async loadPTRs() {
        this.ptrReports = await this.reportsService.getAllPTR();
    }

    async loadDepartments() {
        this.departments = await this.departmentService.getAllDepartments();
    }

    showDialog() {
        this.editingIndex = -1;
        this.ptrForm.reset();
        this.ptrForm.patchValue({
            ptrNo: `PTR-${new Date().getFullYear()}-${String(this.ptrReports.length + 1).padStart(3, '0')}`,
            date: new Date(),
            items: [],
            totalValue: 0,
            status: 'draft'
        });
        this.displayDialog = true;
    }

    async editPTR(ptr: PTR) {
        const fullPTR = await this.reportsService.getPTR(ptr.id);
        if (fullPTR) {
            this.editingIndex = this.ptrReports.findIndex(r => r.id === ptr.id);
            this.ptrForm.patchValue({
                ptrNo: fullPTR.ptrNo,
                entityName: fullPTR.entityName,
                fundCluster: fullPTR.fundCluster,
                fromOfficer: fullPTR.fromOfficer,
                fromDepartment: fullPTR.fromDepartment,
                fromFundCluster: fullPTR.fromFundCluster,
                toOfficer: fullPTR.toOfficer,
                toDepartment: fullPTR.toDepartment,
                toFundCluster: fullPTR.toFundCluster,
                date: fullPTR.date,
                transferType: fullPTR.transferType,
                otherTransferType: fullPTR.otherTransferType,
                totalValue: fullPTR.totalValue,
                transferReason: fullPTR.transferReason,
                remarks: fullPTR.remarks
            });

            // Clear existing items
            const itemsArray = this.ptrForm.get('items') as FormArray;
            itemsArray.clear();

            // Add all items
            fullPTR.items.forEach((item: PTRItem) => {
                itemsArray.push(this.fb.group(item));
            });

            this.displayDialog = true;
        }
    }

    async savePTR() {
        if (this.ptrForm.valid) {
            try {
                const ptrData = {
                    ...this.ptrForm.value,
                    status: 'draft'
                };

                if (this.editingIndex === -1) {
                    await this.reportsService.createPTR(ptrData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'PTR created successfully'
                    });
                } else {
                    const existingPTR = this.ptrReports[this.editingIndex];
                    await this.reportsService.updatePTR(existingPTR.id, ptrData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'PTR updated successfully'
                    });
                }

                await this.loadPTRs();
                this.displayDialog = false;
                this.ptrForm.reset();
            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save PTR'
                });
                console.error('Error saving PTR:', error);
            }
        }
    }

    async deletePTR(ptr: PTR) {
        try {
            await this.reportsService.deletePTR(ptr.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'PTR deleted successfully'
            });
            await this.loadPTRs();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete PTR'
            });
            console.error('Error deleting PTR:', error);
        }
    }

    exportPdf() {
        const doc = new jsPDF();
        const report = this.ptrForm.value;
        
        // Set title
        doc.setFontSize(12);
        doc.text('PROPERTY TRANSFER REPORT', doc.internal.pageSize.width / 2, 15, { align: 'center' });
        
        // Add header section with proper spacing and alignment
        doc.setFontSize(10);
        
        // Entity and Fund Cluster (top row)
        doc.text('Entity Name:', 15, 25);
        doc.text(report.entityName || '_________________', 40, 25);
        doc.text('Fund Cluster:', 140, 25);
        doc.text(report.fundCluster || '_____', 165, 25);
        
        // From/To Officers with proper spacing
        doc.text('From:', 15, 35);
        doc.text(`${report.fromOfficer || '_________________'} / ${report.fromDepartment || '_________________'} / ${report.fromFundCluster || '_____'}`, 30, 35);
        
        doc.text('To:', 15, 45);
        doc.text(`${report.toOfficer || '_________________'} / ${report.toDepartment || '_________________'} / ${report.toFundCluster || '_____'}`, 30, 45);
        
        // Transfer Type section with proper checkbox layout
        doc.text('Transfer Type:', 15, 55);
        
        // Checkboxes in a grid layout
        const checkboxSize = 3;
        const types = ['Donation', 'Relocate', 'Reassignment', 'Others'];
        types.forEach((type, index) => {
            const x = 15 + (index % 2) * 45;
            const y = 60 + Math.floor(index / 2) * 7;
            doc.rect(x, y, checkboxSize, checkboxSize);
            doc.text(type, x + 5, y + 3);
            if (report.transferType === type) {
                doc.text('✓', x + 0.5, y + 2.5);
            }
        });
        
        // Create table with proper column widths and styling
        const headers = [['Date Acquired', 'Property No.', 'Description', 'Amount', 'Condition of PPE']];
        
        // Convert items data for table
        const data = report.items ? report.items.map((item: PTRItem) => [
            new Date(item.dateAcquired).toLocaleDateString(),
            item.propertyNo,
            item.description,
            item.amount.toLocaleString(),
            item.condition
        ]) : [];
        
        autoTable(doc, {
            startY: 80,
            head: headers,
            body: data,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 25 },  // Date Acquired
                1: { cellWidth: 30 },  // Property No
                2: { cellWidth: 70 },  // Description
                3: { cellWidth: 30 },  // Amount
                4: { cellWidth: 30 }   // Condition
            }
        });
        
        // Add Reason for Transfer section
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text('Reason for Transfer:', 15, finalY);
        doc.text(report.transferReason || '', 15, finalY + 5);
        
        // Signature section
        const signY = finalY + 35;
        
        // Add signature lines with proper spacing
        const signatureWidth = 45;
        const startX = 15;
        const spacing = (180 - signatureWidth * 4) / 3;
        
        // Draw signature lines and labels
        [
            { label: 'Signature:', name: report.fromOfficer },
            { label: 'Approved by:', name: '' },
            { label: 'Released/Issued by:', name: '' },
            { label: 'Received by:', name: report.toOfficer }
        ].forEach(({ label, name }, index) => {
            const x = startX + (signatureWidth + spacing) * index;
            
            // Label above line
            doc.setFontSize(8);
            doc.text(label, x, signY);
            
            // Signature line
            doc.line(x, signY + 15, x + signatureWidth, signY + 15);
            
            // Name below line
            doc.text(name || '', x, signY + 20);
            
            // Position line
            doc.line(x, signY + 25, x + signatureWidth, signY + 25);
            
            // Date line
            doc.line(x, signY + 35, x + signatureWidth, signY + 35);
            doc.text('Date:', x, signY + 40);
        });
        
        // Save the PDF
        doc.save(`PTR-${report.ptrNo || 'new'}.pdf`);
    }
} 