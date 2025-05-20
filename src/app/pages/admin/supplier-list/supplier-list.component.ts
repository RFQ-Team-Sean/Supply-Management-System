import { Component, OnInit } from '@angular/core';
import { SuppliersService, Supplier } from 'src/app/services/suppliers.service';
import { ProductsService, Product } from 'src/app/services/products.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    MaterialModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MultiSelectModule,
    ConfirmDialogModule
  ],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  productOptions: Product[] = [];
  supplierForm!: FormGroup;
  supplierDialog = false;
  isEditMode = false;
  currentSupplierId: string | null = null;
  submitted = false;
  loading = false;

  constructor(
    private suppliersService: SuppliersService,
    private productsService: ProductsService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
    this.initializeForm();
  }

  async loadSuppliers(): Promise<void> {
    this.suppliers = await this.suppliersService.getAll();
  }

  async loadProducts(): Promise<void> {
    this.productOptions = await this.productsService.getAll();
  }

  initializeForm(): void {
    this.supplierForm = this.formBuilder.group({
      name: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10,}$/)]],
      email: ['', [Validators.email]],
      productsSupplied: [[], Validators.required],
    });
  }

  openNewSupplierDialog(): void {
    this.supplierForm.reset();
    this.isEditMode = false;
    this.supplierDialog = true;
  }

editSupplier(supplier: Supplier): void {
  // Convert product IDs to actual product objects
  const selectedProducts = supplier.productsSupplied || [];

  this.supplierForm.patchValue({
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    contactNumber: supplier.contactNumber,
    email: supplier.email,
    productsSupplied: selectedProducts  // Pass the array of products directly
  });
  
  this.isEditMode = true;
  this.currentSupplierId = supplier.id || null;
  this.supplierDialog = true;
}



 async saveSupplier(): Promise<void> {
  this.submitted = true;

  if (this.supplierForm.invalid) {
    return;
  }

  const supplierData: Supplier = {
    ...this.supplierForm.value,
    productsSupplied: this.supplierForm.value.productsSupplied, // Save the selected `Product` objects
  };

  if (this.isEditMode && this.currentSupplierId) {
    supplierData.id = this.currentSupplierId;
    await this.suppliersService.editSupplier(supplierData);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Supplier updated successfully!',
    });
  } else {
    await this.suppliersService.addSupplier(supplierData);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'New supplier added successfully!',
    });
  }

  this.supplierDialog = false;
  this.loadSuppliers();
}


 async deleteSupplier(supplier: Supplier): Promise<void> {
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this supplier?',
    accept: async () => {
      await this.suppliersService.deleteSupplier(supplier.id!);
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Successful', 
        detail: 'Supplier deleted successfully' 
      });
      this.loadSuppliers();
    }
  });
}

  hideDialog(): void {
    this.supplierDialog = false;
    this.submitted = false;
    this.supplierForm.reset();
  }

  // In your supplier-list.component.ts
getProductNames(products: Product[] | null | undefined): string {
  if (!products?.length) return '-';
  return products.map(product => product.name).join(', ');
}
  
  async resetData(): Promise<void> {
  const confirmed = confirm('Are you sure you want to reset all data? This cannot be undone.');
  if (!confirmed) return;

  localStorage.clear();
  await this.suppliersService.resetSuppliers();
  await this.productsService.resetProducts();
  await this.loadSuppliers();
  await this.loadProducts();
  
  this.messageService.add({
    severity: 'success',
    summary: 'Reset Complete',
    detail: 'All data has been reset to default'
  });
  }
  
  
}

