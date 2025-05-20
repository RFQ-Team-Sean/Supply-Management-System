import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { DeliveredItem } from '../../../services/delivered-items.service';
import { DeliveryItem } from '../../shared/delivered-items/delivered-items.interface';
import { Requisition } from 'src/app/services/requisition.service';
import { DeliveryReceipt, DeliveryReceiptService } from 'src/app/services/delivery-receipt.service';
import { Stock } from 'src/app/services/stocks.service';
import { PurchaseOrder } from 'src/app/services/purchase-order.service';

interface ChecklistModalData {
  requisition: Requisition;
  deliveryReceipt: DeliveryReceipt;
  purchaseOrder?: PurchaseOrder;
  purchaseOrderItems: Stock[];
}

@Component({
  selector: 'app-checklist-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div class="bg-gray-50 rounded-lg flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="bg-white px-6 py-4 rounded-t-lg border-b flex justify-between items-center flex-shrink-0">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Delivery Checklist</h2>
          <p class="text-sm text-gray-600">{{data.deliveryReceipt.supplier_name}} - Receipt #{{data.deliveryReceipt.receipt_number}}</p>
        </div>
        <button mat-icon-button (click)="closeDialog()" class="text-gray-500">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-grow overflow-y-auto">
        <!-- Purchase Order Details Section -->
        <div class="px-6 py-4 bg-white border-b" *ngIf="data.purchaseOrder">
          <h3 class="text-lg font-semibold mb-3">Purchase Order Details</h3>
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">PO Number</p>
                <p class="text-base font-medium">{{data.purchaseOrder.id}}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Date Created</p>
                <p class="text-base font-medium">{{data.purchaseOrder.dateCreated | date:'mediumDate'}}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <span class="px-2 py-1 text-xs rounded-full"
                  [ngClass]="{
                    'bg-green-100 text-green-800': data.purchaseOrder.status === 'Completed',
                    'bg-blue-100 text-blue-800': data.purchaseOrder.status === 'Pending',
                    'bg-red-100 text-red-800': data.purchaseOrder.status === 'Cancelled'
                  }">
                  {{data.purchaseOrder.status}}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <p class="text-base font-medium">{{data.purchaseOrder.totalAmount | currency:'PHP'}}</p>
              </div>
            </div>
          </div>
          
          <!-- Purchase Order Items Table -->
          <div class="bg-white rounded-lg shadow mb-4" *ngIf="data.purchaseOrderItems.length > 0">
            <h4 class="text-md font-medium px-4 py-3 border-b">Purchase Order Items</h4>
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let item of data.purchaseOrderItems">
                  <td class="px-4 py-2">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <mat-icon class="text-sm">{{'shopping_cart'}}</mat-icon>
                      </div>
                      <span class="ml-3 font-medium text-gray-900">{{item.name}}</span>
                    </div>
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-500">{{item.description || 'No description'}}</td>
                  <td class="px-4 py-2 text-sm">{{item.quantity}}</td>
                  <td class="px-4 py-2 text-sm">{{item.price | currency:'PHP'}}</td>
                  <td class="px-4 py-2 text-sm font-medium">{{(item.price * item.quantity) | currency:'PHP'}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="px-6 py-4 bg-white border-b">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Completion Progress</span>
            <span class="text-sm font-medium text-blue-600">{{getCompletionPercentage()}}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 rounded-full h-2 transition-all duration-300"
                 [style.width]="getCompletionPercentage() + '%'"></div>
          </div>
        </div>

        <!-- Checklist Content -->
        <div class="p-6">
          <div class="bg-white rounded-lg shadow">
            <h4 class="text-md font-medium px-6 py-3 border-b">Delivery Checklist</h4>
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    <div class="flex items-center gap-2">
                      <span>Verification</span>
                      <mat-checkbox 
                        [checked]="allItemsChecked()"
                        [indeterminate]="someItemsChecked() && !allItemsChecked()"
                        (change)="toggleAllItems($event.checked)"
                        color="primary">
                      </mat-checkbox>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let item of data.requisition.products" 
                    class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <mat-icon class="text-sm">{{'inventory_2'}}</mat-icon>
                      </div>
                      <span class="ml-3 font-medium text-gray-900">{{item.name}}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-gray-900">{{item.quantity}}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full"
                          [ngClass]="getStatusClass(item)">
                      {{item.status == 'delivered' ? 'Delivered' : 'Pending'}}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <mat-checkbox
                        [checked] ="item.status == 'delivered'"
                        (change)="updateItemStatus(item)"
                        color="primary">
                        Mark as Delivered
                      </mat-checkbox>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- End Scrollable Content Area -->

      <!-- Footer -->
      <div class="px-6 py-4 bg-white rounded-b-lg border-t flex-shrink-0">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            {{getCheckedItemsCount()}} of {{data.requisition.products.length}} items verified
          </div>
          <div class="flex gap-3">
            <button mat-button 
                    (click)="closeDialog()"
                    class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button mat-raised-button 
                    color="primary"
                    [disabled]="!hasChanges()"
                    (click)="saveChanges()"
                    class="px-4 py-2 rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChecklistModalComponent implements OnInit {
  originalItems: any[] = [];
  drs: DeliveryReceipt[] = [];
  
  constructor(
    private drService: DeliveryReceiptService,
    public dialogRef: MatDialogRef<ChecklistModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChecklistModalData
  ) {
    // Store a DEEP COPY of the original state for comparison
    this.originalItems = JSON.parse(JSON.stringify(data.requisition.products)); 
  }

  ngOnInit(): void {
    // Load delivery receipts if needed for supplier info
    this.loadDRs();
  }

  async loadDRs() {
    this.drs = await this.drService.getAll();
  }

  getCompletionPercentage(): number {
    if (!this.data.requisition.products.length) return 0;
    const checkedCount = this.data.requisition.products.filter(item => item.status == 'delivered').length;
    return Math.round((checkedCount / this.data.requisition.products.length) * 100);
  }

  getStatusClass(item: any): string {
    return item.status == 'delivered' ? 
      'bg-green-100 text-green-800' : 
      'bg-yellow-100 text-yellow-800';
  }

  allItemsChecked(): boolean {
    return this.data.requisition.products.every(item => item.status == 'delivered');
  }

  someItemsChecked(): boolean {
    return this.data.requisition.products.some(item => item.status == 'delivered');
  }

  toggleAllItems(checked: boolean) {
    this.data.requisition.products.forEach(item => {
      item.status = checked ? 'delivered' : 'pending';
    });
  }

  updateItemStatus(item: any) {
    item.status = item.status != 'delivered' ? 'delivered' : 'pending';
  }

  getCheckedItemsCount(): number {
    return this.data.requisition.products.filter(item => item.status == 'delivered').length;
  }

  hasChanges(): boolean {
    return JSON.stringify(this.originalItems) !== JSON.stringify(this.data.requisition.products);
  }

  saveChanges() {
    this.dialogRef.close({ items: this.data.requisition.products });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}