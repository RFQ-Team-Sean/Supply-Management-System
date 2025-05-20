// src/app/department.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { CrudService } from 'src/app/services/crud.service';
import { Department, Building, Office } from 'src/app/schema/schema';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    TabViewModule,
    DropdownModule,
    ToastModule,
    CardModule,
    IconField,
    InputIcon,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  buildings: Building[] = [];
  offices: Office[] = [];
  filteredBuildings: Building[] = [];

  departmentForm!: FormGroup;
  buildingForm!: FormGroup;
  officeForm!: FormGroup;

  departmentDialog = false;
  buildingDialog = false;
  officeDialog = false;

  departmentSubmitted = false;
  buildingSubmitted = false;
  officeSubmitted = false;

  isEditingDepartment = false;
  isEditingBuilding = false;
  isEditingOffice = false;

  loading = false;

  deleteDialogVisible = false;
  deleteItemId: string | null = null;
  deleteItemType: 'department' | 'building' | 'office' | null = null;

  currentDepartmentId: string | null = null;
  currentBuildingId: string | null = null;
  currentOfficeId: string | null = null;

  constructor(
    private crudService: CrudService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.initializeForms();
  }

  async loadAll(): Promise<void> {
    this.loading = true;
    try {
      this.departments = (await this.crudService.getAll(Department)) || [];
      this.buildings = (await this.crudService.getAll(Building)) || [];
      this.offices = (await this.crudService.getAll(Office)) || [];
      // await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
    } finally {
      this.loading = false;
    }
  }

  initializeForms(): void {
    this.departmentForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
    this.buildingForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      numberOfFloors: [1, [Validators.required, Validators.min(1)]],
      dateConstructed: [null],
      notes: ['']
    });
    this.officeForm = this.formBuilder.group({
      name: ['', Validators.required],
      department_id: ['', Validators.required],
      building_id: ['', Validators.required] 
    });
  }

  // Department Methods
  openNewDepartment(): void {
    this.departmentForm.reset();
    this.isEditingDepartment = false;
    this.currentDepartmentId = null;
    this.departmentSubmitted = false;
    this.departmentDialog = true;
  }

  editDepartment(department: Department): void {
    this.isEditingDepartment = true;
    this.currentDepartmentId = department.id ?? null;
    this.departmentForm.patchValue(department);
    this.departmentDialog = true;
  }

  async saveDepartment(): Promise<void> {
    this.departmentSubmitted = true;
    if (this.departmentForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields' });
      return;
    }

    const departmentData = {
      name: this.departmentForm.value.name
    };

    try {
      if (this.isEditingDepartment && this.currentDepartmentId) {
        await this.crudService.update(Department, this.currentDepartmentId, departmentData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Department updated successfully' });
      } else {
        await this.crudService.create(Department, departmentData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Department added successfully' });
      }
      this.departmentDialog = false;
      this.loadAll();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save department: ' + (error.message || 'Unknown error') });
    }
  }

  // Building Methods
  openNewBuilding(): void {
    this.buildingForm.reset({ numberOfFloors: 1 });
    this.isEditingBuilding = false;
    this.currentBuildingId = null;
    this.buildingSubmitted = false;
    this.buildingDialog = true;
  }

  editBuilding(building: Building): void {
    this.isEditingBuilding = true;
    this.currentBuildingId = building.id ?? null;
    this.buildingForm.patchValue(building);
    this.buildingDialog = true;
  }

  async saveBuilding(): Promise<void> {
    this.buildingSubmitted = true;
    if (this.buildingForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields' });
      return;
    }

    const dateValue = this.buildingForm.value.dateConstructed;
    const buildingData = {
      name: this.buildingForm.value.name,
      address: this.buildingForm.value.address,
      numberOfFloors: this.buildingForm.value.numberOfFloors,
      dateConstructed: dateValue ? new Date(dateValue) : undefined
    };

    try {
      if (this.isEditingBuilding && this.currentBuildingId) {
        await this.crudService.update(Building, this.currentBuildingId, buildingData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Building updated successfully' });
      } else {
        await this.crudService.create(Building, buildingData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Building added successfully' });
      }
      this.buildingDialog = false;
      this.loadAll();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save building: ' + (error.message || 'Unknown error') });
    }
  }

  // Office Methods
  openNewOffice(): void {
    this.officeForm.reset({ 
      name: '', 
      department_id: '',
      building_id: ''
    });
    this.isEditingOffice = false;
    this.currentOfficeId = null;
    this.officeSubmitted = false;
    this.officeDialog = true;
  }

  editOffice(office: Office): void {
    this.isEditingOffice = true;
    this.currentOfficeId = office.id ?? null;
    this.officeForm.patchValue({
      name: office.name,
      department_id: office.department_id,
      building_id: office.building_id || ''
    });
    this.officeDialog = true;
  }

  async saveOffice(): Promise<void> {
    this.officeSubmitted = true;
    if (this.officeForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields' });
      return;
    }

    const officeData = {
      name: this.officeForm.value.name,
      department_id: this.officeForm.value.department_id,
      building_id: this.officeForm.value.building_id
    };

    try {
      if (this.isEditingOffice && this.currentOfficeId) {
        await this.crudService.update(Office, this.currentOfficeId, officeData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Office updated successfully' });
      } else {
        await this.crudService.create(Office, officeData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Office added successfully' });
      }
      this.officeDialog = false;
      this.loadAll();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save office: ' + (error.message || 'Unknown error') });
    }
  }

  // Delete Methods
  confirmDelete(type: 'department' | 'building' | 'office', id: string): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this ${type}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.delete(type, id),
    });
  }

  private async delete(type: 'department' | 'building' | 'office', id: string): Promise<void> {
    try {
      switch (type) {
        case 'department':
          await this.crudService.delete(Department, id);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Department deleted successfully' });
          break;
        case 'building':
          await this.crudService.delete(Building, id);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Building deleted successfully' });
          break;
        case 'office':
          await this.crudService.delete(Office, id);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Office deleted successfully' });
          break;
      }
      this.loadAll();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to delete ${type}: ${error.message || 'Unknown error'}` });
    }
  }

  // Utility Methods
  getDepartmentName(departmentId: string): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department?.name || 'N/A';
  }

  getBuildingName(buildingId: string): string {
    const building = this.buildings.find(b => b.id === buildingId);
    return building?.name || 'N/A';
  }

  // Custom Delete Dialog
  openDeleteDialog(type: 'department' | 'building' | 'office', id: string): void {
    this.deleteDialogVisible = true;
    this.deleteItemType = type;
    this.deleteItemId = id;
  }

  confirmDeleteAction(): void {
    if (this.deleteItemType && this.deleteItemId) {
      this.delete(this.deleteItemType, this.deleteItemId);
    }
    this.deleteDialogVisible = false;
    this.deleteItemType = null;
    this.deleteItemId = null;
  }
}