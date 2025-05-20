import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService, Product } from 'src/app/services/products.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MaterialModule } from 'src/app/material.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-product-type',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    ConfirmDialogModule
  ],
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class ProductTypeComponent implements OnInit {
  productTypes: Product[] = [];
  productTypeDialog: boolean = false;
  isEditMode: boolean = false;
  productTypeForm!: FormGroup;
  submitted: boolean = false;
  currentProductTypeId: string | null = null;
  loading: boolean = false;

  constructor(
    private productsService: ProductsService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadProductTypes();
    this.initializeForm();
  }

  async loadProductTypes(): Promise<void> {
    this.loading = true;
    this.productTypes = await this.productsService.getAll();
    this.loading = false;
  }

  initializeForm(): void {
    this.productTypeForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  openNewProductTypeDialog(): void {
    this.productTypeForm.reset();
    this.isEditMode = false;
    this.currentProductTypeId = null;
    this.submitted = false;
    this.productTypeDialog = true;
  }

  editProductType(productType: Product): void {
    this.productTypeForm.patchValue({
      name: productType.name,
      description: productType.description,
    });
    this.isEditMode = true;
    this.currentProductTypeId = productType.id || null;
    this.productTypeDialog = true;
  }

  async saveProductType(): Promise<void> {
    this.submitted = true;

    if (this.productTypeForm.invalid) {
      return;
    }

    const productTypeData: Product = {
      ...this.productTypeForm.value,
    };

    if (this.isEditMode && this.currentProductTypeId) {
      productTypeData.id = this.currentProductTypeId;
      await this.productsService.editProduct(productTypeData);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Product type updated successfully!',
      });
    } else {
      await this.productsService.addProduct(productTypeData);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'New product type added successfully!',
      });
    }

    this.productTypeDialog = false;
    this.loadProductTypes();
  }

  confirmDelete(productType: Product): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the product type "${productType.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.deleteProductType(productType.id!);
      },
    });
  }

  async deleteProductType(id: string): Promise<void> {
    await this.productsService.deleteProduct(id);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Product type deleted successfully!',
    });
    this.loadProductTypes();
  }

  hideDialog(): void {
    this.productTypeDialog = false;
    this.submitted = false;
    this.productTypeForm.reset();
  }
}
