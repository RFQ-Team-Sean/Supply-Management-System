// src/app/pages/admin/inventory/inventory.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';

import { InventoryService, Inventory, InventoryLocation } from 'src/app/services/inventory.service';
import { DepartmentService, Office } from 'src/app/services/departments.service';
import { ItemClassificationService, ItemClassification } from 'src/app/services/item-classification.service';
import { MaterialModule } from 'src/app/material.module';
import { StocksService, Stock } from 'src/app/services/stocks.service';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    TabViewModule,
    FileUpload
  ],
  providers: [ConfirmationService, MessageService]
})
export class InventoryComponent implements OnInit {
  // Inventory
  inventories: Inventory[] = [];
  inventoryLoading = true;
  inventoryDialog = false;
  inventoryForm!: FormGroup;
  isInventoryEditMode = false;
  selectedInventoryId: string | null = null;
  submitted = false;

  // Inventory Locations
  locations: InventoryLocation[] = [];
  locationLoading = true;
  locationDialog = false;
  locationForm!: FormGroup;
  isLocationEditMode = false;
  selectedLocationId: string | null = null;

  // External data for dropdowns
  classifications: ItemClassification[] = [];
  classificationDropdown: { label: string; value: string }[] = [];

  offices: Office[] = [];
  officeDropdown: { label: string; value: string }[] = [];

  // For the inventory "Location" dropdown
  locationDropdown: { label: string; value: string }[] = [];

  constructor(
    private inventoryService: InventoryService,
    private departmentService: DepartmentService,
    private classificationService: ItemClassificationService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private stockService:StocksService,
  ) {}

  async ngOnInit() {
    this.stocks = await this.stockService.getAll();
    this.initializeInventoryForm();
    this.initializeLocationForm();

    // load inventory & location data
    await this.loadInventory();
    await this.loadLocations();

    // load item classifications
    this.classifications = await this.classificationService.getAllClassifications();

    // load offices from DepartmentService
    this.offices = await this.departmentService.getAllOffices();

    // build dropdown arrays
    this.buildDropdowns();


  this.icsForm = this.formBuilder.group({
    icsNumber: ['', Validators.required],
    issuedTo: ['', Validators.required],
    dateIssued: ['', Validators.required],
    status: ['', Validators.required],
    document: [null]
  });

  }

  buildDropdowns() {
    // Classification => itemName
    this.classificationDropdown = this.classifications.map(c => ({
      label: c.category,
      value: c.category
    }));

    // locationDropdown => from inventoryService's "locations"
    this.locationDropdown = this.locations.map(l => ({
      label: l.name,
      value: l.id!
    }));

    // officeDropdown => from departmentService "offices"
    this.officeDropdown = this.offices.map(o => ({
      label: `${o.name} (Room ${o.roomNumber})`,
      value: o.id!
    }));
  }

  // INVENTORY
  private initializeInventoryForm() {
    this.inventoryForm = this.formBuilder.group({
      itemName: ['', Validators.required],
      locationId: ['', Validators.required],
      quantity: [0, Validators.required]
    });
  }

  async loadInventory() {
    this.inventoryLoading = true;
    this.inventories = await this.inventoryService.getAllInventory();
    this.inventoryLoading = false;
  }

  openNewInventoryDialog() {
    this.isInventoryEditMode = false;
    this.selectedInventoryId = null;
    this.submitted = false;
    this.inventoryDialog = true;
    this.inventoryForm.reset({ quantity: 0 });
  }

  editInventory(inv: Inventory) {
    this.isInventoryEditMode = true;
    this.selectedInventoryId = inv.id!;
    this.submitted = false;
    this.inventoryDialog = true;

    this.inventoryForm.patchValue({
      itemName: inv.itemName,
      locationId: inv.locationId,
      quantity: inv.quantity
    });
  }

  async deleteInventory(inv: Inventory) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${inv.itemName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (inv.id) {
          try {
            await this.inventoryService.deleteInventory(inv.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Inventory item deleted'
            });
            await this.loadInventory();
          } catch (err: any) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
          }
        }
      }
    });
  }

  hideInventoryDialog() {
    this.inventoryDialog = false;
    this.submitted = false;
    this.inventoryForm.reset({ quantity: 0 });
  }

  async saveInventory() {
    this.submitted = true;
    if (this.inventoryForm.valid) {
      const data = this.inventoryForm.value as Partial<Inventory>;
      try {
        if (this.isInventoryEditMode && this.selectedInventoryId) {
          const updated: Inventory = { ...data, id: this.selectedInventoryId } as Inventory;
          await this.inventoryService.updateInventory(updated);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Inventory updated'
          });
        } else {
          await this.inventoryService.addInventory(data as Omit<Inventory, 'id'>);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Inventory created'
          });
        }
        this.inventoryDialog = false;
        this.inventoryForm.reset({ quantity: 0 });
        await this.loadInventory();
      } catch (err: any) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
      }
    }
  }

  // For display in table
  getClassificationLabel(itemName: string): string {
    const found = this.classifications.find(c => c.category === itemName);
    return found ? found.category : itemName;
  }
  getLocationLabel(locId: string): string {
    const found = this.locations.find(l => l.id === locId);
    return found ? found.name : 'Unknown';
  }

  // INVENTORY LOCATIONS
  private initializeLocationForm() {
    this.locationForm = this.formBuilder.group({
      name: ['', Validators.required],
      officeId: ['', Validators.required],
      capacity: [1, Validators.required]
    });
  }

  async loadLocations() {
    this.locationLoading = true;
    this.locations = await this.inventoryService.getAllLocations();
    for(let i = 0; i<  this.locations.length; i++){
      this.locations[i].capacity = this.stocks.reduce((acc,curr)=>
        {
          if(curr.storage_id == this.locations[i].id){
            return acc + curr.quantity ;
          }else{
            return acc;
          }
        },
        0
      );
    }
    this.locationLoading = false;
  }

  openNewLocationDialog() {
    this.isLocationEditMode = false;
    this.selectedLocationId = null;
    this.submitted = false;
    this.locationDialog = true;
    this.locationForm.reset({ capacity: 1 });
  }

  editLocation(loc: InventoryLocation) {
    this.isLocationEditMode = true;
    this.selectedLocationId = loc.id!;
    this.submitted = false;
    this.locationDialog = true;

    this.locationForm.patchValue({
      name: loc.name,
      officeId: loc.officeId,
      capacity: loc.capacity
    });
  }


  stocks : Stock[]= [];


  async deleteLocation(loc: InventoryLocation) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete location "${loc.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.inventoryService.deleteLocation(loc.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Location deleted'
          });
          await this.loadLocations();
          await this.loadInventory(); // refresh if needed
        } catch (err: any) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      }
    });
  }

  hideLocationDialog() {
    this.locationDialog = false;
    this.submitted = false;
    this.locationForm.reset({ capacity: 1 });
  }

  async saveLocation() {
    this.submitted = true;
    if (this.locationForm.valid) {
      const data = this.locationForm.value as Partial<InventoryLocation>;
      try {
        if (this.isLocationEditMode && this.selectedLocationId) {
          const updated: InventoryLocation = { ...data, id: this.selectedLocationId } as InventoryLocation;
          await this.inventoryService.updateLocation(updated);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location updated' });
        } else {
          await this.inventoryService.addLocation(data as Omit<InventoryLocation, 'id'>);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location added' });
        }
        this.locationDialog = false;
        this.locationForm.reset({ capacity: 1 });
        await this.loadLocations();
        await this.loadInventory();
      } catch (err: any) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
      }
    }
  }
  
  // Provide label for office in table (if you want to display it in table)
  getOfficeLabel(officeId: string) {
    const found = this.offices.find(o => o.id === officeId);
    if (!found) return 'Unknown';
    return found.name + ' (Room ' + found.roomNumber + ')';
  }

  random2Digits(): number {
  return Math.floor(10 + Math.random() * 90); // Generates a random number between 10 and 99
  }
  
  // Inventory Custodian Slip (ICS)
icsList = [
  { icsNumber: 'ICS-2024-001', issuedTo: 'John Doe', dateIssued: '2024-01-15', status: 'Active', document: null },
  { icsNumber: 'ICS-2024-002', issuedTo: 'Jane Smith', dateIssued: '2024-01-20', status: 'Pending', document: null }
];

icsDialog = false;
icsForm!: FormGroup;
isICSEditMode = false;

icsStatusDropdown = [
  { label: 'Active', value: 'Active' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Returned', value: 'Returned' }
];


openNewICSDialog() {
  this.isICSEditMode = false;
  this.icsDialog = true;
  this.icsForm.reset();
}

editICS(ics: any) {
  this.isICSEditMode = true;
  this.icsDialog = true;
  this.icsForm.patchValue(ics);
}

hideICSDialog() {
  this.icsDialog = false;
  this.submitted = false;
}

saveICS() {
  console.log('Saving ICS:', this.icsForm.value);
  this.icsDialog = false;
}

onICSUpload(event: any) {
  const file = event.files[0];
  this.icsForm.patchValue({ document: file.name });
}
// View ICS Document (Dummy - Open in New Tab)
viewICS(file: any) {
  alert(`Opening ${file.name}`);
}



}

