import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-product-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [style]="{width: '50vw'}" 
      [modal]="true"
      header="Manage Product Types">
      
      <div class="mb-4">
        <form [formGroup]="productTypeForm" (ngSubmit)="onSubmit()">
          <div class="flex gap-2">
            <div class="flex-grow">
              <input 
                pInputText 
                formControlName="name"
                placeholder="Enter product type name"
                class="w-full"
              />
            </div>
            <p-button 
              type="submit" 
              [disabled]="!productTypeForm.valid"
              [label]="editingType ? 'Update' : 'Add'"
            ></p-button>
          </div>
        </form>
      </div>

      <p-table [value]="productTypes" [scrollable]="true" scrollHeight="400px">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th style="width: 100px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-type>
          <tr>
            <td>{{type.name}}</td>
            <td>
              <div class="flex gap-2">
                <button 
                  pButton 
                  icon="pi pi-pencil" 
                  class="p-button-rounded p-button-primary p-button-sm"
                  (click)="editType(type)"
                ></button>
                <button 
                  pButton 
                  icon="pi pi-trash" 
                  class="p-button-rounded p-button-danger p-button-sm"
                  (click)="deleteType(type)"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

    </p-dialog>
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class ProductTypeDialogComponent implements OnInit {
  visible: boolean = false;
  productTypes: any[] = [];
  productTypeForm: FormGroup;
  editingType: any = null;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.productTypeForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProductTypes();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  loadProductTypes() {
    // TODO: Implement API call to get product types
    this.productTypes = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Office Supplies' },
      // Add more mock data as needed
    ];
  }

  onSubmit() {
    if (this.productTypeForm.valid) {
      if (this.editingType) {
        // Update existing type
        this.updateProductType();
      } else {
        // Add new type
        this.addProductType();
      }
    }
  }

  addProductType() {
    // TODO: Implement API call to add product type
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Product type added successfully'
    });
    this.productTypeForm.reset();
  }

  updateProductType() {
    // TODO: Implement API call to update product type
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Product type updated successfully'
    });
    this.editingType = null;
    this.productTypeForm.reset();
  }

  editType(type: any) {
    this.editingType = type;
    this.productTypeForm.patchValue({
      name: type.name
    });
  }

  deleteType(type: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this product type?',
      accept: () => {
        // TODO: Implement API call to delete product type
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product type deleted successfully'
        });
      }
    });
  }
} 