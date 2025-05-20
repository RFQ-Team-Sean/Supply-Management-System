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
import { DropdownModule } from 'primeng/dropdown';
import { ReportsGenerationService } from '../../../services/reports.generation.service';
import { RPCPPE, RPCPPEItem } from '../../../schema/schema';

@Component({
    selector: 'app-rpcppe',
    templateUrl: './rpcppe.component.html',
    styleUrls: ['./rpcppe.component.scss'],
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
export class RPCPPEComponent implements OnInit {
    rpcppeReports: RPCPPE[] = [];
    displayDialog: boolean = false;
    displayItemDialog: boolean = false;
    rpcppeForm: FormGroup;
    editingIndex: number = -1;
    editingItemIndex: number = -1;
    itemsForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private reportsService: ReportsGenerationService,
        private messageService: MessageService
    ) {
        this.rpcppeForm = this.fb.group({
            rpcppeNo: ['', Validators.required],
            entityName: ['', Validators.required],
            fundCluster: ['', Validators.required],
            accountableOfficer: ['', Validators.required],
            designation: ['', Validators.required],
            accountabilityDate: [new Date(), Validators.required],
            date: [new Date(), Validators.required],
            totalValue: [0, Validators.required],
            remarks: [''],
            items: this.fb.array([])
        });

        this.itemsForm = this.fb.group({
            id: [''],
            rpcppeId: [''],
            article: ['', Validators.required],
            description: ['', Validators.required],
            propertyNo: ['', Validators.required],
            quantity: [0, [Validators.required, Validators.min(0)]],
            unitValue: [0, [Validators.required, Validators.min(0)]],
            totalValue: [0, Validators.required],
            shortageQty: [0, Validators.min(0)],
            shortageValue: [0],
            remarks: ['']
        });

        // Set up value change subscriptions for auto-calculation
        this.itemsForm.get('quantity')?.valueChanges.subscribe(() => {
            this.calculateItemTotal();
            this.calculateShortageValue();
        });

        this.itemsForm.get('unitValue')?.valueChanges.subscribe(() => {
            this.calculateItemTotal();
            this.calculateShortageValue();
        });

        this.itemsForm.get('shortageQty')?.valueChanges.subscribe(() => {
            this.calculateShortageValue();
        });
    }

    ngOnInit() {
        // Format date fields to be compatible with input[type="date"]
        const today = new Date().toISOString().split('T')[0];
        this.rpcppeForm.get('accountabilityDate')?.setValue(today);
        this.rpcppeForm.get('date')?.setValue(today);
        
        this.loadRPCPPEs();
    }

    loadRPCPPEs() {
        this.reportsService.getAllRPCPPE().subscribe({
            next: (data) => {
                console.log('RPCPPE data received:', data);
                
                // Normalize data to handle both snake_case and camelCase properties
                this.rpcppeReports = data.map((rpcppe: any) => {
                    // Ensure we have a consistent object structure
                    return {
                        id: rpcppe.id,
                        rpcppeNo: rpcppe.rpcppeNo || rpcppe.rpcppe_no,
                        entityName: rpcppe.entityName || rpcppe.entity_name,
                        fundCluster: rpcppe.fundCluster || rpcppe.fund_cluster,
                        accountableOfficer: rpcppe.accountableOfficer || rpcppe.accountable_officer,
                        designation: rpcppe.designation,
                        accountabilityDate: rpcppe.accountabilityDate || rpcppe.accountability_date,
                        date: rpcppe.date,
                        totalValue: rpcppe.totalValue || rpcppe.total_value,
                        remarks: rpcppe.remarks,
                        status: rpcppe.status,
                        items: (rpcppe.items || []).map((item: any) => ({
                            id: item.id,
                            rpcppeId: item.rpcppeId || item.rpcppe_id,
                            article: item.article,
                            description: item.description,
                            propertyNo: item.propertyNo || item.property_no,
                            quantity: item.quantity,
                            unitValue: item.unitValue || item.unit_value,
                            totalValue: item.totalValue || item.total_value,
                            shortageQty: item.shortageQty || item.shortage_qty || 0,
                            shortageValue: item.shortageValue || item.shortage_value || 0,
                            remarks: item.remarks || ''
                        }))
                    };
                });
                
                console.log('Normalized RPCPPE reports:', this.rpcppeReports);
            },
            error: (error) => {
                console.error('Error loading RPCPPE:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load RPCPPE reports'
                });
            }
        });
    }

    showDialog() {
        this.editingIndex = -1;
        this.rpcppeForm.reset();
        
        // Make sure to clear the items array
        const itemsArray = this.rpcppeForm.get('items') as FormArray;
        itemsArray.clear();
        
        this.rpcppeForm.patchValue({
            rpcppeNo: `RPCPPE-${new Date().getFullYear()}-${String(this.rpcppeReports.length + 1).padStart(3, '0')}`,
            date: new Date(),
            accountabilityDate: new Date(),
            totalValue: 0
        });
        
        this.displayDialog = true;
    }

    editRPCPPE(rpcppe: RPCPPE) {
        console.log('Starting to edit RPCPPE with ID:', rpcppe.id);
        
        this.reportsService.getRPCPPE(rpcppe.id).subscribe({
            next: (fullRPCPPE: any) => {
                this.editingIndex = this.rpcppeReports.findIndex(r => r.id === rpcppe.id);
                console.log('Editing RPCPPE - Raw data:', JSON.stringify(fullRPCPPE, null, 2));
                
                // First, reset the form completely
                this.rpcppeForm.reset();
                
                // Clear existing items
                const itemsArray = this.rpcppeForm.get('items') as FormArray;
                itemsArray.clear();
                
                // Parse dates from server
                const accountabilityDate = this.formatDateForInput(fullRPCPPE.accountabilityDate || fullRPCPPE.accountability_date);
                const date = this.formatDateForInput(fullRPCPPE.date);
                
                console.log('Formatted dates:', { accountabilityDate, date });
                
                // Create form data object from the normalized RPCPPE
                const formData = {
                    rpcppeNo: fullRPCPPE.rpcppeNo || fullRPCPPE.rpcppe_no || '',
                    entityName: fullRPCPPE.entityName || fullRPCPPE.entity_name || '',
                    fundCluster: fullRPCPPE.fundCluster || fullRPCPPE.fund_cluster || '',
                    accountableOfficer: fullRPCPPE.accountableOfficer || fullRPCPPE.accountable_officer || '',
                    designation: fullRPCPPE.designation || '',
                    accountabilityDate: accountabilityDate,
                    date: date,
                    totalValue: Number(fullRPCPPE.totalValue || fullRPCPPE.total_value || 0),
                    remarks: fullRPCPPE.remarks || ''
                };
                
                console.log('Form data to set (raw values from server):', formData);
                
                // Use patchValue for more reliable form updates
                this.rpcppeForm.patchValue({
                    ...formData,
                    items: [] // items array is handled separately
                });
                
                console.log('Form after patchValue:', this.rpcppeForm.getRawValue());

                // Add all items, mapping property names as needed
                const items = fullRPCPPE.items || [];
                console.log('Items to add:', items);
                
                if (items.length > 0) {
                    items.forEach((item: any) => {
                        const formGroup = this.fb.group({
                            id: item.id,
                            rpcppeId: item.rpcppeId || item.rpcppe_id,
                            article: item.article,
                            description: item.description,
                            propertyNo: item.propertyNo || item.property_no,
                            quantity: Number(item.quantity || 0),
                            unitValue: Number(item.unitValue || item.unit_value || 0),
                            totalValue: Number(item.totalValue || item.total_value || 0),
                            shortageQty: Number(item.shortageQty || item.shortage_qty || 0),
                            shortageValue: Number(item.shortageValue || item.shortage_value || 0),
                            remarks: item.remarks || ''
                        });
                        
                        itemsArray.push(formGroup);
                    });
                }

                // Log the form values after patching for debugging
                console.log('Final form values:', this.rpcppeForm.getRawValue());

                // Display the dialog immediately to avoid issues with delayed showing
                this.displayDialog = true;
            },
            error: (error) => {
                console.error('Error loading RPCPPE details:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load RPCPPE details'
                });
            }
        });
    }

    // Helper method to format dates for input elements
    private formatDateForInput(dateString: string | Date): string {
        if (!dateString) {
            return new Date().toISOString().split('T')[0];
        }
        
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input[type="date"]
        } catch (e) {
            console.error('Error formatting date:', e);
            return new Date().toISOString().split('T')[0];
        }
    }

    deleteRPCPPE(rpcppe: RPCPPE) {
        this.reportsService.deleteRPCPPE(rpcppe.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'RPCPPE report deleted successfully'
                });
                this.loadRPCPPEs();
            },
            error: (error) => {
                console.error('Error deleting RPCPPE:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete RPCPPE report'
                });
            }
        });
    }

    saveRPCPPE() {
        if (this.rpcppeForm.valid) {
            const formValues = this.rpcppeForm.value;
            
            // Log the form values before processing
            console.log('Form values before processing:', formValues);
            
            // Ensure all items have the correct property names before saving
            const itemsArray = this.rpcppeForm.get('items') as FormArray;
            const formattedItems = itemsArray.controls.map(control => {
                const item = control.value;
                return {
                    id: item.id || null,
                    rpcppeId: item.rpcppeId || null,
                    article: item.article || '',
                    description: item.description || '',
                    propertyNo: item.propertyNo || '',
                    quantity: Number(item.quantity) || 0,
                    unitValue: Number(item.unitValue) || 0,
                    totalValue: Number(item.totalValue) || 0,
                    shortageQty: Number(item.shortageQty) || 0,
                    shortageValue: Number(item.shortageValue) || 0,
                    remarks: item.remarks || ''
                };
            });
            
            // Format dates to ensure they're in the correct format
            const accountabilityDate = new Date(formValues.accountabilityDate);
            const date = new Date(formValues.date);
            
            const rpcppeData: Omit<RPCPPE, 'id'> = {
                rpcppeNo: formValues.rpcppeNo || '',
                entityName: formValues.entityName || '',
                fundCluster: formValues.fundCluster || '',
                accountableOfficer: formValues.accountableOfficer || '',
                designation: formValues.designation || '',
                accountabilityDate: accountabilityDate,
                date: date,
                totalValue: Number(formValues.totalValue) || 0,
                remarks: formValues.remarks || '',
                status: 'draft' as 'draft' | 'final',
                items: formattedItems
            };

            // Log the final data being sent to the server
            console.log('Data being sent to server:', rpcppeData);

            const operation = this.editingIndex === -1 ?
                this.reportsService.createRPCPPE(rpcppeData) :
                this.reportsService.updateRPCPPE(this.rpcppeReports[this.editingIndex].id, rpcppeData);

            operation.subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `RPCPPE report ${this.editingIndex === -1 ? 'created' : 'updated'} successfully`
                    });
                    this.loadRPCPPEs();
                    this.displayDialog = false;
                    this.rpcppeForm.reset();
                },
                error: (error) => {
                    console.error('Error saving RPCPPE:', error);
                    // Log the error response details
                    if (error.error) {
                        console.error('Error details:', error.error);
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to save RPCPPE report. Please check the console for details.'
                    });
                }
            });
        } else {
            console.error('Form is invalid:', this.rpcppeForm.errors);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill in all required fields correctly.'
            });
        }
    }

    showItemDialog() {
        this.editingItemIndex = -1;
        this.itemsForm.reset();
        this.displayItemDialog = true;
    }

    editItem(index: number) {
        const itemsArray = this.rpcppeForm.get('items') as FormArray;
        this.editingItemIndex = index;
        this.itemsForm.patchValue(itemsArray.at(index).value);
        this.displayItemDialog = true;
    }

    deleteItem(index: number) {
        const itemsArray = this.rpcppeForm.get('items') as FormArray;
        itemsArray.removeAt(index);
        this.updateTotalValue();
    }

    saveItem() {
        if (this.itemsForm.valid) {
            const itemsArray = this.rpcppeForm.get('items') as FormArray;
            
            // Calculate final values before saving
            this.calculateItemTotal();
            this.calculateShortageValue();
            
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

    updateTotalValue() {
        const itemsArray = this.rpcppeForm.get('items') as FormArray;
        const total = itemsArray.controls.reduce((sum, control) => {
            return sum + (control.get('totalValue')?.value || 0);
        }, 0);
        this.rpcppeForm.patchValue({ totalValue: total }, { emitEvent: false });
    }

    private calculateItemTotal() {
        const quantity = this.itemsForm.get('quantity')?.value || 0;
        const unitValue = this.itemsForm.get('unitValue')?.value || 0;
        this.itemsForm.patchValue({ totalValue: quantity * unitValue }, { emitEvent: false });
    }

    private calculateShortageValue() {
        const shortageQty = this.itemsForm.get('shortageQty')?.value || 0;
        const unitValue = this.itemsForm.get('unitValue')?.value || 0;
        this.itemsForm.patchValue({ shortageValue: shortageQty * unitValue }, { emitEvent: false });
    }

    exportPdf(rpcppe?: RPCPPE) {
        const doc = new jsPDF();
        let formData;
        
        // Use either the provided RPCPPE or the form data
        if (rpcppe) {
            const rpcppeAny = rpcppe as any;
            formData = {
                rpcppeNo: rpcppe.rpcppeNo || rpcppeAny.rpcppe_no,
                entityName: rpcppe.entityName || rpcppeAny.entity_name,
                fundCluster: rpcppe.fundCluster || rpcppeAny.fund_cluster,
                accountableOfficer: rpcppe.accountableOfficer || rpcppeAny.accountable_officer,
                designation: rpcppe.designation,
                accountabilityDate: rpcppe.accountabilityDate || rpcppeAny.accountability_date,
                date: rpcppe.date,
                items: rpcppe.items || [],
                totalValue: rpcppe.totalValue || rpcppeAny.total_value,
                remarks: rpcppe.remarks
            };
        } else {
            formData = this.rpcppeForm.value;
        }
        
        // Set title
        doc.setFontSize(12);
        doc.text('REPORT ON THE PHYSICAL COUNT OF PROPERTY, PLANT AND EQUIPMENT', doc.internal.pageSize.width / 2, 15, { align: 'center' });
        
        // Add header section with proper spacing and alignment
        doc.setFontSize(10);
        
        // Type of Property line
        doc.text('(Type of Property, Plant and Equipment)', doc.internal.pageSize.width / 2, 25, { align: 'center' });
        
        // As at line with current date
        const currentDate = new Date(formData.date).toLocaleDateString();
        doc.text(`As at ${currentDate}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
        
        // Entity and Fund Cluster
        doc.text('Entity Name:', 15, 45);
        doc.text(formData.entityName || '', 45, 45);
        doc.text('Fund Cluster:', 140, 45);
        doc.text(formData.fundCluster || '', 170, 45);
        
        // Accountable Officer line
        doc.text('For which', 15, 55);
        doc.text(formData.accountableOfficer || '', 40, 55);
        doc.text(',', 102, 55);
        doc.text(formData.designation || '', 110, 55);
        doc.text('is accountable,', 152, 55);
        
        // Accountability date
        const accountabilityDate = new Date(formData.accountabilityDate).toLocaleDateString();
        doc.text('having assumed such accountability on', 15, 65);
        doc.text(accountabilityDate, 90, 65);
        
        // Create table with proper styling
        const headers = [
            [
                'ARTICLE',
                'DESCRIPTION',
                'PROPERTY NO.',
                'QTY',
                'UNIT VALUE',
                'TOTAL VALUE',
                { content: 'SHORTAGE/OVERAGE', colSpan: 2, styles: { halign: 'center', fontSize: 7 } },
                'REMARKS'
            ],
            [
                '', '', '', '', '', '',
                'Quantity',
                'Value',
                ''
            ]
        ];
        
        // Convert form items to table data
        const items = formData.items || [];
        const data = items.map((item: RPCPPEItem) => [
            item.article,
            item.description,
            item.propertyNo,
            item.quantity.toString(),
            item.unitValue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            item.shortageQty.toString(),
            item.shortageValue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            item.remarks
        ]);
    
        // Add table
        (doc as any).autoTable({
            head: headers,
            body: data,
            startY: 75,
            theme: 'plain', // Changed from 'grid' to 'plain'
            styles: {
                fontSize: 8,
                cellPadding: 1.5,
                lineWidth: 0.1, // Thin lines
                lineColor: [0, 0, 0], // Black lines
                overflow: 'linebreak',
                halign: 'left'
            },
            headStyles: {
                fontStyle: 'bold'
            },
            columnStyles: {
                3: { halign: 'right' }, // QTY
                4: { halign: 'right' }, // UNIT VALUE
                5: { halign: 'right' }, // TOTAL VALUE
                6: { halign: 'right' }, // SHORTAGE QTY
                7: { halign: 'right' }  // SHORTAGE VALUE
            }
        });
            
        // Add signature section
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        
        // Add signature lines with proper spacing
        const signatureWidth = 50;
        const startX = 15;
        const spacing = (180 - signatureWidth * 3) / 2;
        
        // Draw signature lines and labels
        [
            { label: 'Certified Correct by:', x: startX },
            { label: 'Approved by:', x: startX + signatureWidth + spacing },
            { label: 'Verified by:', x: startX + (signatureWidth + spacing) * 2 }
        ].forEach(({ label, x }, index) => {
            // Label above line
            doc.setFontSize(9);
            doc.text(label, x, finalY);
            
            // Signature line
            doc.line(x, finalY + 15, x + signatureWidth, finalY + 15);
            
            // Labels below line
            doc.setFontSize(8);
            if (index === 0) {
                doc.text('Signature over Printed Name of', x, finalY + 20);
                doc.text('Inventory Committee Chair', x, finalY + 25);
                doc.text('and Members', x, finalY + 30);
            } else if (index === 1) {
                doc.text('Signature over Printed Name of Head of', x, finalY + 20);
                doc.text('Agency/Entity or Authorized Representative', x, finalY + 25);
            } else {
                doc.text('Signature over Printed Name of', x, finalY + 20);
                doc.text('COA Representative', x, finalY + 25);
            }
        });
        
        // Save the PDF
        doc.save(`RPCPPE-${formData.rpcppeNo}.pdf`);
    }

    cancelDialog() {
        // Properly clear the form when canceling
        this.rpcppeForm.reset();
        
        // Clear items array
        const itemsArray = this.rpcppeForm.get('items') as FormArray;
        itemsArray.clear();
        
        // Reset editing state
        this.editingIndex = -1;
        
        // Close dialog
        this.displayDialog = false;
        
        console.log('Dialog canceled and form cleared');
    }
}