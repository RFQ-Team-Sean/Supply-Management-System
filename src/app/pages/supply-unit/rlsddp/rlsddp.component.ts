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
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextarea } from 'primeng/inputtextarea';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportsGenerationService } from '../../../services/reports.generation.service';
import { RLSDDP, RLSDDPItem } from '../../../schema/schema';

@Component({
    selector: 'app-rlsddp',
    templateUrl: './rlsddp.component.html',
    styleUrls: ['./rlsddp.component.scss'],
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
        ToastModule,
        CheckboxModule,
        InputTextarea
    ]
})
export class RLSDDPComponent implements OnInit {
    rlsddpReports: RLSDDP[] = [];
    displayDialog: boolean = false;
    displayItemDialog: boolean = false;
    rlsddpForm: FormGroup;
    editingIndex: number = -1;
    editingItemIndex: number = -1;
    itemsForm: FormGroup;

    propertyStatuses: any[] = [
        { label: 'Lost', value: 'Lost' },
        { label: 'Stolen', value: 'Stolen' },
        { label: 'Damaged', value: 'Damaged' },
        { label: 'Destroyed', value: 'Destroyed' }
    ];

    constructor(
        private fb: FormBuilder,
        private reportsService: ReportsGenerationService,
        private messageService: MessageService
    ) {
        this.initializeForms();
    }

    private initializeForms() {
        this.rlsddpForm = this.fb.group({
            rlsddpNo: ['', Validators.required],
            entityName: ['', Validators.required],
            fundCluster: ['', Validators.required],
            department: ['', Validators.required],
            accountableOfficer: ['', Validators.required],
            designation: ['', Validators.required],
            date: ['', Validators.required],
            parNo: ['', Validators.required],
            propertyStatus: ['', Validators.required],
            policeNotified: [false],
            policeStation: [''],
            policeNotificationDate: [''],
            items: this.fb.array([]),
            circumstances: ['', Validators.required],
            totalValue: [0, [Validators.required, Validators.min(0)]],
            govtIdNo: [''],
            govtIdDateIssued: ['']
        });

        this.itemsForm = this.fb.group({
            propertyNo: ['', Validators.required],
            description: ['', Validators.required],
            dateAcquired: ['', Validators.required],
            acquisitionCost: [0, [Validators.required, Validators.min(0)]],
            propertyStatus: ['', Validators.required],
            remarks: ['']
        });
    }

    async ngOnInit() {
        await this.loadRLSDDPs();
    }

    async loadRLSDDPs() {
        this.rlsddpReports = await this.reportsService.getAllRLSDDP();
    }

    showDialog() {
        this.editingIndex = -1;
        this.rlsddpForm.reset();
        this.rlsddpForm.patchValue({
            rlsddpNo: `RLSDDP-${new Date().getFullYear()}-${String(this.rlsddpReports.length + 1).padStart(3, '0')}`,
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

    async editRLSDDP(rlsddp: RLSDDP) {
        const fullRLSDDP = await this.reportsService.getRLSDDP(rlsddp.id);
        if (fullRLSDDP) {
            this.editingIndex = this.rlsddpReports.findIndex(r => r.id === rlsddp.id);
            this.rlsddpForm.patchValue({
                ...fullRLSDDP,
                date: new Date(fullRLSDDP.date).toISOString().split('T')[0],
                policeNotificationDate: fullRLSDDP.policeNotificationDate ? 
                    new Date(fullRLSDDP.policeNotificationDate).toISOString().split('T')[0] : null,
                govtIdDateIssued: fullRLSDDP.govtIdDateIssued ? 
                    new Date(fullRLSDDP.govtIdDateIssued).toISOString().split('T')[0] : null
            });

            // Clear existing items
            const itemsArray = this.rlsddpForm.get('items') as FormArray;
            itemsArray.clear();

            // Add all items
            fullRLSDDP.items.forEach(item => {
                itemsArray.push(this.fb.group({
                    ...item,
                    dateAcquired: new Date(item.dateAcquired).toISOString().split('T')[0]
                }));
            });

            this.displayDialog = true;
        }
    }

    editItem(index: number) {
        this.editingItemIndex = index;
        const itemsArray = this.rlsddpForm.get('items') as FormArray;
        const item = itemsArray.at(index);
        this.itemsForm.patchValue(item.value);
        this.displayItemDialog = true;
    }

    saveItem() {
        if (this.itemsForm.valid) {
            const itemsArray = this.rlsddpForm.get('items') as FormArray;
            if (this.editingItemIndex === -1) {
                itemsArray.push(this.fb.group(this.itemsForm.value));
            } else {
                itemsArray.at(this.editingItemIndex).patchValue(this.itemsForm.value);
            }
            this.displayItemDialog = false;
            this.itemsForm.reset();

            // Update total value
            this.updateTotalValue();
        }
    }

    private updateTotalValue() {
        const items = (this.rlsddpForm.get('items') as FormArray).value;
        const total = items.reduce((sum: number, item: RLSDDPItem) => sum + (item.acquisitionCost || 0), 0);
        this.rlsddpForm.patchValue({ totalValue: total });
    }

    deleteItem(index: number) {
        const itemsArray = this.rlsddpForm.get('items') as FormArray;
        itemsArray.removeAt(index);
        this.updateTotalValue();
    }

    async saveRLSDDP() {
        if (this.rlsddpForm.valid) {
            try {
                const rlsddpData = {
                    ...this.rlsddpForm.value,
                    status: 'draft'
                };

                if (this.editingIndex === -1) {
                    await this.reportsService.createRLSDDP(rlsddpData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'RLSDDP created successfully'
                    });
                } else {
                    const existingRLSDDP = this.rlsddpReports[this.editingIndex];
                    await this.reportsService.updateRLSDDP(existingRLSDDP.id, rlsddpData);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'RLSDDP updated successfully'
                    });
                }

                await this.loadRLSDDPs();
                this.displayDialog = false;
                this.rlsddpForm.reset();
            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save RLSDDP'
                });
                console.error('Error saving RLSDDP:', error);
            }
        }
    }

    async deleteRLSDDP(rlsddp: RLSDDP) {
        try {
            await this.reportsService.deleteRLSDDP(rlsddp.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'RLSDDP deleted successfully'
            });
            await this.loadRLSDDPs();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete RLSDDP'
            });
            console.error('Error deleting RLSDDP:', error);
        }
    }

    exportPdf() {
        const doc = new jsPDF();
        const report = this.rlsddpForm.value;
        
        // Set title
        doc.setFontSize(12);
        doc.text('REPORT OF LOST, STOLEN, DAMAGED OR DESTROYED PROPERTY', doc.internal.pageSize.width / 2, 15, { align: 'center' });
        
        // Add header section with proper spacing and alignment
        doc.setFontSize(10);
        
        // Entity and Fund Cluster (top row)
        doc.text('Entity Name:', 15, 25);
        doc.text(report.entityName || '_________________', 40, 25);
        doc.text('Fund Cluster:', 140, 25);
        doc.text(report.fundCluster || '_____', 165, 25);
        
        // Department and RLSDDP details
        doc.text('Department/Office:', 15, 35);
        doc.text(report.department || '_________________', 50, 35);
        
        doc.text('RLSDDP No.:', 140, 35);
        doc.text(report.rlsddpNo || '_____', 165, 35);
        
        // Accountable Officer and Date
        doc.text('Accountable Officer:', 15, 45);
        doc.text(report.accountableOfficer || '_________________', 50, 45);
        
        doc.text('RLSDDP Date:', 140, 45);
        doc.text(report.date ? new Date(report.date).toLocaleDateString() : '_____', 165, 45);
        
        // Designation and PAR No
        doc.text('Designation:', 15, 55);
        doc.text(report.designation || '_________________', 50, 55);
        
        doc.text('PAR No.:', 140, 55);
        doc.text(report.parNo || '_____', 165, 55);
        
        // Police notification section
        doc.text('Police Notified:', 15, 65);
        const checkboxSize = 3;
        doc.rect(50, 62, checkboxSize, checkboxSize);
        doc.text('Yes', 55, 65);
        doc.rect(70, 62, checkboxSize, checkboxSize);
        doc.text('No', 75, 65);
        
        // Add checkmark based on policeNotified value
        if (report.policeNotified) {
            doc.text('✓', 50.5, 64.5);
        } else {
            doc.text('✓', 70.5, 64.5);
        }
        
        doc.text('Police Station:', 100, 65);
        doc.text(report.policeStation || '_____', 130, 65);
        doc.text('Date:', 165, 65);
        doc.text(report.policeNotificationDate ? new Date(report.policeNotificationDate).toLocaleDateString() : '_____', 175, 65);
        
        // Status of Property section
        doc.text('Status of Property: (check applicable box)', 15, 75);
        
        // Property status checkboxes with dynamic checking
        const statuses = ['Lost', 'Stolen', 'Damaged', 'Destroyed'];
        const statusY = 82;
        statuses.forEach((status, index) => {
            const x = 15 + index * 35;
            doc.rect(x, statusY - 3, checkboxSize, checkboxSize);
            doc.text(status, x + 5, statusY);
            if (report.propertyStatus === status) {
                doc.text('✓', x + 0.5, statusY - 0.5);
            }
        });
        
        // Create table with proper styling
        const headers = [['Property No.', 'Description', 'Date Acquired', 'Acquisition Cost']];
        
        // Convert items data for table
        const data = report.items ? report.items.map((item: RLSDDPItem) => [
            item.propertyNo,
            item.description,
            new Date(item.dateAcquired).toLocaleDateString(),
            item.acquisitionCost.toLocaleString()
        ]) : [];
        
        autoTable(doc, {
            startY: 90,
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
                0: { cellWidth: 50 },
                1: { cellWidth: 90 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 }
            }
        });
        
        // Add Circumstances section
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text('Circumstances:', 15, finalY);
        doc.text(report.circumstances || '', 15, finalY + 5, {
            maxWidth: 180,
            lineHeightFactor: 1.5
        });
        
        // Certification section
        const certY = finalY + 40;
        doc.setFontSize(9);
        doc.text('I hereby certify that the items and circumstances stated above are true and correct.', 15, certY);
        
        doc.text('Noted by:', doc.internal.pageSize.width - 60, certY);
        
        // Signature section
        const signY = certY + 20;
        
        // Left signature
        doc.line(15, signY, 90, signY);
        doc.setFontSize(8);
        doc.text(report.accountableOfficer || '', 15, signY - 5, { align: 'center' });
        doc.text('Signature over Printed Name of the Accountable Officer', 15, signY + 5);
        
        // Right signature
        doc.line(doc.internal.pageSize.width - 90, signY, doc.internal.pageSize.width - 15, signY);
        doc.text('Signature over Printed Name of the Immediate', doc.internal.pageSize.width - 90, signY + 5);
        doc.text('Supervisor', doc.internal.pageSize.width - 90, signY + 10);
        
        // Date lines
        const dateY = signY + 20;
        doc.text('Date:', 15, dateY);
        doc.text(new Date().toLocaleDateString(), 35, dateY);
        
        doc.text('Date:', doc.internal.pageSize.width - 90, dateY);
        doc.text(new Date().toLocaleDateString(), doc.internal.pageSize.width - 70, dateY);
        
        // Government ID section
        const govY = dateY + 15;
        doc.text('Government Issued ID:', 15, govY);
        doc.text('ID No.:', 15, govY + 7);
        doc.text(report.govtIdNo || '_____', 35, govY + 7);
        doc.text('Date Issued:', 15, govY + 14);
        doc.text(report.govtIdDateIssued ? new Date(report.govtIdDateIssued).toLocaleDateString() : '_____', 40, govY + 14);
        
        // Notary section
        const notaryY = govY + 25;
        doc.setFontSize(9);
        doc.text('SUBSCRIBED AND SWORN to before me this _____ day of __________, affiant exhibiting the above', 15, notaryY);
        doc.text('government issued identification card.', 15, notaryY + 7);
        
        // Notary details
        const detailsY = notaryY + 20;
        doc.text('Doc. No. _________', 15, detailsY);
        doc.text('Page No. _________', 15, detailsY + 7);
        doc.text('Book No. _________', 15, detailsY + 14);
        doc.text('Series of _________', 15, detailsY + 21);
        
        // Notary line
        doc.line(doc.internal.pageSize.width - 90, detailsY + 10, doc.internal.pageSize.width - 15, detailsY + 10);
        doc.text('Notary Public', doc.internal.pageSize.width - 70, detailsY + 15);
        
        // Save the PDF
        doc.save(`RLSDDP-${report.rlsddpNo || 'new'}.pdf`);
    }
} 