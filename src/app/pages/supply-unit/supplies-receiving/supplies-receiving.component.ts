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
import { DividerModule } from 'primeng/divider';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-supplies-receiving',
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
    DividerModule,
    ConfirmPopupModule,
    InputNumberModule,
    DropdownModule,
    ToastModule,
    TextareaModule,
    CalendarModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './supplies-receiving.component.html',
  styleUrls: ['./supplies-receiving.component.scss']
})
export class SuppliesReceivingComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  supplies: ReceivingItem[] = [];
  showSupplyDialog: boolean = false;
  isEditing: boolean = false;
  selectedSupply: ReceivingItem | null = null;
  searchValue: string = '';

  supplyForm = new FormGroup({
    itemName: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    unit: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    supplier: new FormControl('', Validators.required),
    receivedDate: new FormControl<Date | null>(null, Validators.required),
    expiryDate: new FormControl<Date | null>(null),
    storageLocation: new FormControl('', Validators.required),
    remarks: new FormControl('')
  });

  unitOptions = [
    { label: 'Piece', value: 'pc' },
    { label: 'Box', value: 'box' },
    { label: 'Pack', value: 'pack' },
    { label: 'Ream', value: 'ream' },
    { label: 'Set', value: 'set' },
    { label: 'Roll', value: 'roll' },
    { label: 'Bottle', value: 'bottle' }
  ];

  categoryOptions = [
    { label: 'Office Supplies', value: 'office_supplies' },
    { label: 'Cleaning Materials', value: 'cleaning_materials' },
    { label: 'Computer Supplies', value: 'computer_supplies' },
    { label: 'Kitchen Supplies', value: 'kitchen_supplies' },
    { label: 'Medical Supplies', value: 'medical_supplies' }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private receivingService: ReceivingService
  ) {}

  async ngOnInit() {
    await this.fetchItems();
  }

  async fetchItems() {
    try {
      this.supplies = await this.receivingService.getByType('supplies');
    } catch (error) {
      console.error('Error fetching supplies:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch supplies'
      });
    }
  }

  openNewDialog() {
    this.isEditing = false;
    this.selectedSupply = null;
    this.supplyForm.reset();
    this.showSupplyDialog = true;
  }

  editSupply(supply: ReceivingItem) {
    this.isEditing = true;
    this.selectedSupply = supply;
    this.supplyForm.patchValue({
      itemName: supply.itemName,
      description: supply.description,
      quantity: supply.quantity,
      unit: supply.unit,
      category: supply.category,
      supplier: supply.supplier,
      receivedDate: new Date(supply.receivedDate),
      expiryDate: supply.expiryDate ? new Date(supply.expiryDate) : null,
      storageLocation: supply.storageLocation,
      remarks: supply.remarks
    });
    this.showSupplyDialog = true;
  }

  async deleteSupply(event: Event, supply: ReceivingItem) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this supply item?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.receivingService.deleteItem(supply.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Supply item deleted successfully'
          });
          await this.fetchItems();
        } catch (error) {
          console.error('Error deleting supply:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete supply item'
          });
        }
      }
    });
  }

  async saveSupply() {
    if (this.supplyForm.valid) {
      const formValue = this.supplyForm.value;
      
      const supply: Omit<ReceivingItem, 'id'> = {
        itemName: formValue.itemName || '',
        description: formValue.description || '',
        quantity: formValue.quantity || 0,
        unit: formValue.unit || '',
        category: formValue.category || '',
        supplier: formValue.supplier || '',
        receivedDate: formValue.receivedDate || new Date(),
        expiryDate: formValue.expiryDate || undefined,
        storageLocation: formValue.storageLocation || '',
        remarks: formValue.remarks || '',
        status: 'pending',
        type: 'supplies',
        condition: 'new' // Default condition for supplies
      };

      try {
        if (this.isEditing && this.selectedSupply) {
          await this.receivingService.updateItem({
            ...supply,
            id: this.selectedSupply.id
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Supply item updated successfully'
          });
        } else {
          await this.receivingService.addItem(supply);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Supply item added successfully'
          });
        }

        this.showSupplyDialog = false;
        this.supplyForm.reset();
        await this.fetchItems();
      } catch (error) {
        console.error('Error saving supply:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save supply item'
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

  async approveSupply(supply: ReceivingItem) {
    try {
      await this.receivingService.approveItem(supply.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Supply item approved successfully'
      });
      await this.fetchItems();
    } catch (error) {
      console.error('Error approving supply:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve supply item'
      });
    }
  }

  async rejectSupply(supply: ReceivingItem) {
    try {
      await this.receivingService.rejectItem(supply.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Supply item rejected'
      });
      await this.fetchItems();
    } catch (error) {
      console.error('Error rejecting supply:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject supply item'
      });
    }
  }

  hideDialog() {
    this.showSupplyDialog = false;
    this.supplyForm.reset();
  }
}
