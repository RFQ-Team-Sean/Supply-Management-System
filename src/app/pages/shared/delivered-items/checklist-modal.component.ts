import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { DeliveredItem } from '../../../services/delivered-items.service';
import { DeliveryItem } from './delivered-items.interface';

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
    <div class="bg-gray-50 rounded-lg">
      <!-- Header -->
      <div class="bg-white px-6 py-4 rounded-t-lg border-b flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Delivery Checklist</h2>
          <p class="text-sm text-gray-600">{{data.supplierName}} - {{data.supplierId}}</p>
        </div>
        <button mat-icon-button (click)="closeDialog()" class="text-gray-500">
          <mat-icon>close</mat-icon>
        </button>
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

      <!-- Content -->
      <div class="p-6">
        <div class="bg-white rounded-lg shadow">
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
              <tr *ngFor="let item of data.items" 
                  class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <mat-icon class="text-sm">{{getItemIcon(item)}}</mat-icon>
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
                    {{item.isDelivered ? 'Delivered' : 'Pending'}}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <mat-checkbox 
                      [(ngModel)]="item.isDelivered"
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

      <!-- Footer -->
      <div class="px-6 py-4 bg-white rounded-b-lg border-t">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            {{getCheckedItemsCount()}} of {{data.items.length}} items verified
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
export class ChecklistModalComponent {
  originalItems: DeliveryItem[] = [];

  constructor(
    public dialogRef: MatDialogRef<ChecklistModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeliveredItem
  ) {
    // Store original state for comparison
    this.originalItems = JSON.parse(JSON.stringify(data.items));
  }

  getCompletionPercentage(): number {
    if (!this.data.items.length) return 0;
    const checkedCount = this.data.items.filter(item => item.isDelivered).length;
    return Math.round((checkedCount / this.data.items.length) * 100);
  }

  getStatusClass(item: DeliveryItem): string {
    return item.isDelivered ? 
      'bg-green-100 text-green-800' : 
      'bg-yellow-100 text-yellow-800';
  }

  getItemIcon(item: DeliveryItem): string {
    if (item.name.toLowerCase().includes('laptop')) return 'laptop';
    if (item.name.toLowerCase().includes('monitor')) return 'desktop_windows';
    if (item.name.toLowerCase().includes('mouse')) return 'mouse';
    if (item.name.toLowerCase().includes('chair')) return 'chair';
    if (item.name.toLowerCase().includes('cabinet')) return 'inbox';
    return 'inventory_2';
  }

  allItemsChecked(): boolean {
    return this.data.items.every(item => item.isDelivered);
  }

  someItemsChecked(): boolean {
    return this.data.items.some(item => item.isDelivered);
  }

  toggleAllItems(checked: boolean) {
    this.data.items.forEach(item => {
      item.isDelivered = checked;
      this.updateItemStatus(item);
    });
  }

  updateItemStatus(item: DeliveryItem) {
    item.status = item.isDelivered ? 'delivered' : 'pending';
    if (item.isDelivered) {
      item.dateChecked = new Date();
    } else {
      item.dateChecked = undefined;
    }
  }

  getCheckedItemsCount(): number {
    return this.data.items.filter(item => item.isDelivered).length;
  }

  hasChanges(): boolean {
    return JSON.stringify(this.originalItems) !== JSON.stringify(this.data.items);
  }

  saveChanges() {
    this.dialogRef.close({ items: this.data.items });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}