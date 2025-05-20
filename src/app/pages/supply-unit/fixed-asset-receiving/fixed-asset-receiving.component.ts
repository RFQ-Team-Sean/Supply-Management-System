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
  selector: 'app-fixed-asset-receiving',
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
  templateUrl: './fixed-asset-receiving.component.html',
  styleUrls: ['./fixed-asset-receiving.component.scss']
})
export class FixedAssetReceivingComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  assets: ReceivingItem[] = [];
  showAssetDialog: boolean = false;
  isEditing: boolean = false;
  selectedAsset: ReceivingItem | null = null;
  searchValue: string = '';

  assetForm = new FormGroup({
    assetName: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    serialNumber: new FormControl('', Validators.required),
    model: new FormControl('', Validators.required),
    manufacturer: new FormControl('', Validators.required),
    receivedDate: new FormControl<Date | null>(null, Validators.required),
    purchasePrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    condition: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    remarks: new FormControl('')
  });

  conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' }
  ];

  categoryOptions = [
    { label: 'Equipment', value: 'equipment' },
    { label: 'Machinery', value: 'machinery' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Vehicles', value: 'vehicles' },
    { label: 'IT Assets', value: 'it_assets' }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private receivingService: ReceivingService
  ) {}

  async ngOnInit() {
    await this.fetchAssets();
  }

  async fetchAssets() {
    try {
      console.log('Fetching fixed assets...');
      this.assets = await this.receivingService.getByType('fixed_asset');
      console.log('Fetched assets:', this.assets);
    } catch (error) {
      console.error('Error fetching assets:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch assets'
      });
    }
  }

  openNewDialog() {
    this.isEditing = false;
    this.selectedAsset = null;
    this.assetForm.reset();
    this.showAssetDialog = true;
  }

  editAsset(asset: ReceivingItem) {
    this.isEditing = true;
    this.selectedAsset = asset;
    this.assetForm.patchValue({
      assetName: asset.itemName,
      description: asset.description,
      serialNumber: asset.serialNumber,
      model: asset.model,
      manufacturer: asset.manufacturer,
      receivedDate: new Date(asset.receivedDate),
      purchasePrice: asset.purchasePrice,
      condition: asset.condition,
      location: asset.location,
      category: asset.category,
      remarks: asset.remarks
    });
    this.showAssetDialog = true;
  }

  async deleteAsset(event: Event, asset: ReceivingItem) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this asset?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.receivingService.deleteItem(asset.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset deleted successfully'
          });
          await this.fetchAssets();
        } catch (error) {
          console.error('Error deleting asset:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete asset'
          });
        }
      }
    });
  }

  async saveAsset() {
    if (this.assetForm.valid) {
      const formValue = this.assetForm.value;
      
      const asset: Omit<ReceivingItem, 'id'> = {
        itemName: formValue.assetName || '',
        description: formValue.description || '',
        serialNumber: formValue.serialNumber || '',
        model: formValue.model || '',
        manufacturer: formValue.manufacturer || '',
        receivedDate: formValue.receivedDate || new Date(),
        purchasePrice: formValue.purchasePrice || 0,
        condition: formValue.condition || '',
        location: formValue.location || '',
        category: formValue.category || '',
        remarks: formValue.remarks || '',
        status: 'pending',
        type: 'fixed_asset',
        quantity: 1,
        unit: 'unit'
      };

      try {
        if (this.isEditing && this.selectedAsset) {
          await this.receivingService.updateItem({
            ...asset,
            id: this.selectedAsset.id
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset updated successfully'
          });
        } else {
          await this.receivingService.addItem(asset);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset added successfully'
          });
        }

        this.showAssetDialog = false;
        this.assetForm.reset();
        await this.fetchAssets();
      } catch (error) {
        console.error('Error saving asset:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save asset'
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

  async approveAsset(asset: ReceivingItem) {
    try {
      await this.receivingService.approveItem(asset.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Asset approved successfully'
      });
      await this.fetchAssets();
    } catch (error) {
      console.error('Error approving asset:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve asset'
      });
    }
  }

  async rejectAsset(asset: ReceivingItem) {
    try {
      await this.receivingService.rejectItem(asset.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Asset rejected'
      });
      await this.fetchAssets();
    } catch (error) {
      console.error('Error rejecting asset:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject asset'
      });
    }
  }

  hideDialog() {
    this.showAssetDialog = false;
    this.assetForm.reset();
  }
}
