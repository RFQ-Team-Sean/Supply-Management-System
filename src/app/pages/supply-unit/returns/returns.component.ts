import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Textarea } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';

type StatusType = 'Pending' | 'Approved' | 'Rejected' | 'Completed';
type SeverityType = 'success' | 'info' | 'warn' | 'danger';

interface ReturnRequest {
    requestNo: string;
    requestedBy: string;
    department: string;
    dateRequested: Date;
    status: StatusType;
    items: ReturnItem[];
    reason: string;
    remarks?: string;
    approvedBy?: string;
    approvalDate?: Date;
    auditLogs: AuditLog[];
}

interface ReturnItem {
    propertyNo: string;
    description: string;
    quantity: number;
    condition: string;
    remarks?: string;
}

interface AuditLog {
    action: string;
    performedBy: string;
    timestamp: Date;
    details: string;
}

@Component({
    selector: 'app-returns',
    templateUrl: './returns.component.html',
    styleUrls: ['./returns.component.scss'],
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
        Textarea,
        TagModule,
        TimelineModule,
        AvatarModule
    ]
})
export class ReturnsComponent implements OnInit {
    returnRequests: ReturnRequest[] = [];
    displayDialog: boolean = false;
    displayItemDialog: boolean = false;
    displayAuditDialog: boolean = false;
    returnForm: FormGroup;
    itemForm: FormGroup;
    editingIndex: number = -1;
    editingItemIndex: number = -1;
    currentRole: 'Super Admin' | 'Administrator' | 'User' = 'User'; // This should be fetched from auth service
    items: ReturnItem[] = [];
    selectedRequest: ReturnRequest | null = null;

    statusColors: Record<StatusType, SeverityType> = {
        'Pending': 'warn',
        'Approved': 'info',
        'Rejected': 'danger',
        'Completed': 'success'
    };

    conditions: any[] = [
        { label: 'Good', value: 'Good' },
        { label: 'Fair', value: 'Fair' },
        { label: 'Poor', value: 'Poor' },
        { label: 'Damaged', value: 'Damaged' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService
    ) {
        this.returnForm = this.fb.group({
            requestNo: ['', Validators.required],
            requestedBy: ['', Validators.required],
            department: ['', Validators.required],
            dateRequested: [new Date(), Validators.required],
            status: ['Pending', Validators.required],
            reason: ['', Validators.required],
            remarks: [''],
            items: this.fb.array([])
        });

        this.itemForm = this.fb.group({
            propertyNo: ['', Validators.required],
            description: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            condition: ['', Validators.required],
            remarks: ['']
        });
    }

    ngOnInit() {
        // Sample data
        this.returnRequests = [
            {
                requestNo: 'RR-2024-001',
                requestedBy: 'John Doe',
                department: 'IT Department',
                dateRequested: new Date(),
                status: 'Pending',
                items: [
                    {
                        propertyNo: 'PC-2024-001',
                        description: 'Desktop Computer',
                        quantity: 1,
                        condition: 'Good',
                        remarks: 'Upgrade required'
                    }
                ],
                reason: 'Equipment upgrade needed',
                auditLogs: [
                    {
                        action: 'Request Created',
                        performedBy: 'John Doe',
                        timestamp: new Date(),
                        details: 'Return request initiated'
                    }
                ]
            }
        ];
    }

    showDialog() {
        this.editingIndex = -1;
        this.returnForm.reset();
        this.items = [];
        this.returnForm.patchValue({
            requestNo: `RR-${new Date().getFullYear()}-${String(this.returnRequests.length + 1).padStart(3, '0')}`,
            dateRequested: new Date(),
            status: 'Pending'
        });
        this.displayDialog = true;
    }

    showItemDialog() {
        this.editingItemIndex = -1;
        this.itemForm.reset();
        this.displayItemDialog = true;
    }

    editRequest(request: ReturnRequest) {
        if (this.canEditRequest(request)) {
            this.editingIndex = this.returnRequests.findIndex(r => r.requestNo === request.requestNo);
            this.returnForm.patchValue(request);
            this.items = [...request.items];
            this.displayDialog = true;
        }
    }

    deleteRequest(request: ReturnRequest) {
        if (this.canDeleteRequest(request)) {
            const index = this.returnRequests.findIndex(r => r.requestNo === request.requestNo);
            if (index > -1) {
                this.returnRequests.splice(index, 1);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Return request deleted successfully'
                });
                this.addAuditLog(request.requestNo, 'Request Deleted');
            }
        }
    }

    saveRequest() {
        if (this.returnForm.valid && this.items.length > 0) {
            const requestData = {
                ...this.returnForm.value,
                items: [...this.items],
                auditLogs: []
            };

            if (this.editingIndex === -1) {
                // Create new request
                requestData.auditLogs = [{
                    action: 'Request Created',
                    performedBy: requestData.requestedBy,
                    timestamp: new Date(),
                    details: 'Return request initiated'
                }];
                this.returnRequests.push(requestData);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Return request created successfully'
                });
            } else {
                // Update existing request
                const existingLogs = this.returnRequests[this.editingIndex].auditLogs;
                requestData.auditLogs = [
                    ...existingLogs,
                    {
                        action: 'Request Updated',
                        performedBy: requestData.requestedBy,
                        timestamp: new Date(),
                        details: 'Return request updated'
                    }
                ];
                this.returnRequests[this.editingIndex] = requestData;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Return request updated successfully'
                });
            }

            this.displayDialog = false;
            this.returnForm.reset();
            this.items = [];
        }
    }

    editItem(index: number) {
        this.editingItemIndex = index;
        this.itemForm.patchValue(this.items[index]);
        this.displayItemDialog = true;
    }

    deleteItem(index: number) {
        this.items.splice(index, 1);
    }

    saveItem() {
        if (this.itemForm.valid) {
            const itemData = this.itemForm.value;

            if (this.editingItemIndex === -1) {
                this.items.push(itemData);
            } else {
                this.items[this.editingItemIndex] = itemData;
            }

            this.displayItemDialog = false;
            this.itemForm.reset();
        }
    }

    approveRequest(request: ReturnRequest) {
        if (this.canApproveRequest()) {
            const index = this.returnRequests.findIndex(r => r.requestNo === request.requestNo);
            if (index > -1) {
                this.returnRequests[index] = {
                    ...request,
                    status: 'Approved',
                    approvedBy: 'Current User', // Should be fetched from auth service
                    approvalDate: new Date(),
                    auditLogs: [
                        ...request.auditLogs,
                        {
                            action: 'Request Approved',
                            performedBy: 'Current User', // Should be fetched from auth service
                            timestamp: new Date(),
                            details: 'Return request approved'
                        }
                    ]
                };
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Return request approved successfully'
                });
                this.syncInventory(request);
            }
        }
    }

    rejectRequest(request: ReturnRequest) {
        if (this.canApproveRequest()) {
            const index = this.returnRequests.findIndex(r => r.requestNo === request.requestNo);
            if (index > -1) {
                this.returnRequests[index] = {
                    ...request,
                    status: 'Rejected',
                    approvedBy: 'Current User', // Should be fetched from auth service
                    approvalDate: new Date(),
                    auditLogs: [
                        ...request.auditLogs,
                        {
                            action: 'Request Rejected',
                            performedBy: 'Current User', // Should be fetched from auth service
                            timestamp: new Date(),
                            details: 'Return request rejected'
                        }
                    ]
                };
                this.messageService.add({
                    severity: 'info',
                    summary: 'Info',
                    detail: 'Return request rejected'
                });
            }
        }
    }

    completeReturn(request: ReturnRequest) {
        if (this.canCompleteReturn()) {
            const index = this.returnRequests.findIndex(r => r.requestNo === request.requestNo);
            if (index > -1) {
                this.returnRequests[index] = {
                    ...request,
                    status: 'Completed',
                    auditLogs: [
                        ...request.auditLogs,
                        {
                            action: 'Return Completed',
                            performedBy: 'Current User', // Should be fetched from auth service
                            timestamp: new Date(),
                            details: 'Return process completed'
                        }
                    ]
                };
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Return process completed successfully'
                });
            }
        }
    }

    showAuditLogs(request: ReturnRequest) {
        this.selectedRequest = request;
        this.displayAuditDialog = true;
    }

    private addAuditLog(requestNo: string, action: string) {
        const index = this.returnRequests.findIndex(r => r.requestNo === requestNo);
        if (index > -1) {
            this.returnRequests[index].auditLogs.push({
                action: action,
                performedBy: 'Current User', // Should be fetched from auth service
                timestamp: new Date(),
                details: `Action performed: ${action}`
            });
        }
    }

    private syncInventory(request: ReturnRequest) {
        // This method should integrate with your inventory management system
        console.log('Syncing inventory for request:', request);
    }

    // Role-based permission methods
    canCreateRequest(): boolean {
        return true; // All roles can create requests
    }

    canEditRequest(request: ReturnRequest): boolean {
        return this.currentRole === 'Super Admin' || 
               (this.currentRole === 'Administrator' && request.status === 'Pending') ||
               (request.status === 'Pending');
    }

    canDeleteRequest(request: ReturnRequest): boolean {
        return this.currentRole === 'Super Admin' || 
               (this.currentRole === 'Administrator' && request.status === 'Pending');
    }

    canApproveRequest(): boolean {
        return this.currentRole === 'Super Admin' || this.currentRole === 'Administrator';
    }

    canCompleteReturn(): boolean {
        return this.currentRole === 'Super Admin' || this.currentRole === 'Administrator';
    }

    getStatusSeverity(status: StatusType): SeverityType {
        return this.statusColors[status];
    }
} 