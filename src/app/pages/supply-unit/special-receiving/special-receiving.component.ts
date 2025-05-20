import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ReceivingService, ReceivingItem } from 'src/app/services/receiving.service';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Table } from 'primeng/table';
import { WarehouseService } from 'src/app/services/warehouse.service';
import { Warehouse } from 'src/app/schema/schema';

@Component({
  selector: 'app-special-receiving',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TooltipModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    ToastModule,
    TextareaModule,
    ConfirmPopupModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './special-receiving.component.html',
  styleUrls: ['./special-receiving.component.scss']
})
export class SpecialReceivingComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  items: ReceivingItem[] = [];
  showItemDialog: boolean = false;
  isEditing: boolean = false;
  selectedItem: ReceivingItem | null = null;
  searchValue: string = '';
  showDetailsDialog: boolean = false;
  warehouses: Warehouse[] = [];
  selectedWarehouse: Warehouse | null = null;

  itemForm = new FormGroup({
    itemName: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    unit: new FormControl('', Validators.required),
    condition: new FormControl('', Validators.required),
    donor: new FormControl('', Validators.required),
    receivedDate: new FormControl<Date | null>(null, Validators.required),
    remarks: new FormControl('')
  });

  conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' }
  ];

  unitOptions = [
    { label: 'Piece', value: 'pc' },
    { label: 'Set', value: 'set' },
    { label: 'Unit', value: 'unit' },
    { label: 'Box', value: 'box' },
    { label: 'Package', value: 'pkg' }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private receivingService: ReceivingService,
    private warehouseService: WarehouseService
  ) {}

  async ngOnInit() {
    await this.fetchItems();
    await this.fetchWarehouses();
    
    // Listen for inventory updates to refresh our items
    window.addEventListener('inventory-updated', () => {
      this.fetchItems();
    });
  }

  async fetchWarehouses() {
    try {
      this.warehouses = await this.warehouseService.getAll();
      console.log('Fetched warehouses:', this.warehouses);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch warehouses'
      });
    }
  }

  async fetchItems() {
    try {
      console.log('Fetching special receiving items...');
      this.items = await this.receivingService.getByType('special');
      console.log('Fetched items:', this.items);
    } catch (error) {
      console.error('Error fetching items:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch items'
      });
    }
  }

  openNewDialog() {
    this.isEditing = false;
    this.selectedItem = null;
    this.itemForm.reset();
    this.showItemDialog = true;
  }

  editItem(item: ReceivingItem) {
    this.isEditing = true;
    this.selectedItem = item;
    this.itemForm.patchValue({
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      condition: item.condition,
      donor: item.donor,
      receivedDate: new Date(item.receivedDate),
      remarks: item.remarks
    });
    this.showItemDialog = true;
  }

  async deleteItem(event: Event, item: ReceivingItem) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this item?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.receivingService.deleteItem(item.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item deleted successfully'
          });
          await this.fetchItems();
        } catch (error) {
          console.error('Error deleting item:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete item'
          });
        }
      }
    });
  }

  async saveItem() {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      
      const item: Omit<ReceivingItem, 'id'> = {
        itemName: formValue.itemName || '',
        description: formValue.description || '',
        quantity: formValue.quantity || 0,
        unit: formValue.unit || '',
        condition: formValue.condition || '',
        donor: formValue.donor || '',
        receivedDate: formValue.receivedDate || new Date(),
        remarks: formValue.remarks || '',
        status: 'pending',
        type: 'special'
      };

      try {
        if (this.isEditing && this.selectedItem) {
          await this.receivingService.updateItem({
            ...item,
            id: this.selectedItem.id
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item updated successfully'
          });
        } else {
          await this.receivingService.addItem(item);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item added successfully'
          });
        }

        this.showItemDialog = false;
        this.itemForm.reset();
        await this.fetchItems();
      } catch (error) {
        console.error('Error saving item:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save item'
        });
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields'
      });
    }
  }

  // Submit item to inventory
  async submitItem(item: ReceivingItem) {
    if (!this.selectedWarehouse) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a warehouse first'
      });
      return;
    }

    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: `Are you sure you want to submit this item to ${this.selectedWarehouse.name}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // Use the submitItem method from the service with warehouse info
          const success = await this.receivingService.submitItem(item, this.selectedWarehouse);
          
          if (success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Item submitted to ${this.selectedWarehouse!.name} successfully`
            });
            // Close details dialog if open
            this.showDetailsDialog = false;
            this.selectedWarehouse = null;
            // Fetch updated items
            await this.fetchItems();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to submit item to inventory'
            });
          }
        } catch (error) {
          console.error('Error submitting item:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit item to inventory'
          });
        }
      }
    });
  }

  viewDetails(item: ReceivingItem) {
    this.selectedItem = item;
    this.selectedWarehouse = null; // Reset warehouse selection
    this.showDetailsDialog = true;
  }

  hideDialog() {
    this.showItemDialog = false;
    this.itemForm.reset();
    this.itemForm.enable();
  }

  getConditionSeverity(condition: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (condition?.toLowerCase()) {
      case 'excellent':
      case 'new':
        return 'success';
      case 'good':
        return 'info';
      case 'fair':
        return 'warn';
      case 'poor':
        return 'danger';
      default:
        return 'secondary';
    }
  }
  
  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warn';
      case 'rejected':
        return 'danger';
      default:
        return 'info';
    }
  }

  /**
   * Get CSS class based on condition
   * @param condition The condition value
   * @returns CSS class for condition styling
   */
  getConditionClass(condition: string): string {
    switch (condition?.toLowerCase()) {
      case 'new':
      case 'excellent':
        return 'status-approved'; // Use green color for excellent/new condition
      case 'good':
        return 'status-issued'; // Use blue color for good condition
      case 'fair':
        return 'status-pending'; // Use yellow/orange for fair condition
      case 'poor':
        return 'status-returned'; // Use red for poor condition
      default:
        return 'status-pending';
    }
  }
}
