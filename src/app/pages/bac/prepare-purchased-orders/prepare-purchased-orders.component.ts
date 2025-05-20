// prepare-purchased-orders.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Item {
  name: string;
  quantity: number;
  price: number;
}

interface ApprovalLog {
  action: string;
  timestamp: Date;
  user: string;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  items: Item[];
  totalCost: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  approvalLogs: ApprovalLog[];
}

@Component({
  selector: 'app-prepare-purchased-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prepare-purchased-orders.component.html',
  styleUrls: ['./prepare-purchased-orders.component.scss'],
})
export class PreparePurchasedOrdersComponent {
  // Dummy data for suppliers
  suppliers: string[] = ['Supplier A', 'Supplier B', 'Supplier C'];
  // Current PO being created
  purchaseOrder: PurchaseOrder = {
    id: this.generateId(),
    supplier: '',
    items: [],
    totalCost: 0,
    status: 'Draft',
    approvalLogs: [],
  };
  // New item being added to the PO
  newItem = { name: '', quantity: 1, price: 0 };

  // Add an item to the PO
  addItem() {
    if (this.newItem.name && this.newItem.quantity > 0 && this.newItem.price >= 0) {
      this.purchaseOrder.items.push({ ...this.newItem });
      this.updateTotalCost();
      this.newItem = { name: '', quantity: 1, price: 0 }; // Reset form
    }
  }

  // Remove an item from the PO
  removeItem(index: number) {
    this.purchaseOrder.items.splice(index, 1);
    this.updateTotalCost();
  }

  // Update the total cost of the PO
  updateTotalCost() {
    this.purchaseOrder.totalCost = this.purchaseOrder.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  }

  // Submit the PO for approval
  submitForApproval() {
    if (this.purchaseOrder.supplier && this.purchaseOrder.items.length > 0) {
      this.purchaseOrder.status = 'Submitted';
      this.logApprovalAction('Submitted for approval');
      alert('Purchase Order submitted for approval.');
    } else {
      alert('Please select a supplier and add at least one item.');
    }
  }

  // Log approval actions
  logApprovalAction(action: string) {
    this.purchaseOrder.approvalLogs.push({
      action,
      timestamp: new Date(),
      user: 'BAC Member', // Replace with actual user from your auth service
    });
  }

  // Generate a random ID for the PO
  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}