import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-purchase-orders-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    TabViewModule,
    DropdownModule
  ],
  templateUrl: './purchase-orders-admin.component.html',
  styleUrls: ['./purchase-orders-admin.component.scss'],
  providers: [MessageService]
})
export class PurchaseOrdersAdminComponent implements OnInit {
  purchaseOrders: any[] = [];
  isModalVisible = false;
  isReceiveModalVisible = false;
  isEditMode = false;
  currentPurchaseOrder: any = {
    id: '',
    title: '',
    totalValue: 0,
    requestedBy: '',
    status: 'Pending'
  };
  selectedPurchaseOrder: any = {};

  constructor(private messageService: MessageService) {}

  async ngOnInit() {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders() {
    this.purchaseOrders = [
      { id: 'PO-1001', title: 'Office Supplies', totalValue: 1500, requestedBy: 'Admin', dateCreated: new Date(), status: 'Pending' },
      { id: 'PO-1002', title: 'Laptops', totalValue: 5000, requestedBy: 'IT Dept.', dateCreated: new Date(), status: 'Pending' }
    ];
  }

  openCreatePurchaseOrderModal() {
    this.isEditMode = false;
    this.currentPurchaseOrder = { id: '', title: '', totalValue: 0, requestedBy: '', status: 'Pending' };
    this.isModalVisible = true;
  }

  

  closeModal() {
    this.isModalVisible = false;
  }

  savePurchaseOrder() {
    if (this.isEditMode) {
      this.purchaseOrders = this.purchaseOrders.map(po => po.id === this.currentPurchaseOrder.id ? this.currentPurchaseOrder : po);
    } else {
      this.currentPurchaseOrder.id = `PO-${Math.floor(Math.random() * 100000)}`;
      this.currentPurchaseOrder.dateCreated = new Date();
      this.purchaseOrders.push(this.currentPurchaseOrder);
    }

    this.closeModal();
  }

  deletePurchaseOrder(poId: string) {
    this.purchaseOrders = this.purchaseOrders.filter(po => po.id !== poId);
    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `Purchase Order ${poId} has been deleted.`
    });
  }


  openReceivePurchaseOrderModal() {
    this.isReceiveModalVisible = true;
  }
  closeReceivePurchaseOrderModal() {
    this.isReceiveModalVisible = false;
  }

  receivePurchaseOrder() {
    this.purchaseOrders = this.purchaseOrders.map(po =>
      po.id === this.selectedPurchaseOrder.id ? { ...po, status: 'Received' } : po
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Received',
      detail: `Purchase Order ${this.selectedPurchaseOrder.id} has been marked as received.`
    });

    this.closeReceivePurchaseOrderModal();
  }

  getStatusClass(status: string) {
    return status === 'Received' ? 'bg-green-500' : 'bg-yellow-500';
  }

  isEditModalVisible: boolean = false;

openEditPurchaseOrderModal() {
  this.isEditModalVisible = true;
}

closeEditModal() {
  this.isEditModalVisible = false;
}

}
