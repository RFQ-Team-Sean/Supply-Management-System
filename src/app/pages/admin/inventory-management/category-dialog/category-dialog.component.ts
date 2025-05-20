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
  selector: 'app-category-dialog',
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
      header="Manage Categories">
      
      <div class="mb-4">
        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
          <div class="flex gap-2">
            <div class="flex-grow">
              <input 
                pInputText 
                formControlName="name"
                placeholder="Enter category name"
                class="w-full"
              />
            </div>
            <div class="flex-grow">
              <input 
                pInputText 
                formControlName="description"
                placeholder="Enter category description"
                class="w-full"
              />
            </div>
            <p-button 
              type="submit" 
              [disabled]="!categoryForm.valid"
              [label]="editingCategory ? 'Update' : 'Add'"
            ></p-button>
          </div>
        </form>
      </div>

      <p-table [value]="categories" [scrollable]="true" scrollHeight="400px">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th style="width: 100px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-category>
          <tr>
            <td>{{category.name}}</td>
            <td>{{category.description}}</td>
            <td>
              <div class="flex gap-2">
                <button 
                  pButton 
                  icon="pi pi-pencil" 
                  class="p-button-rounded p-button-primary p-button-sm"
                  (click)="editCategory(category)"
                ></button>
                <button 
                  pButton 
                  icon="pi pi-trash" 
                  class="p-button-rounded p-button-danger p-button-sm"
                  (click)="deleteCategory(category)"
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
export class CategoryDialogComponent implements OnInit {
  visible: boolean = false;
  categories: any[] = [];
  categoryForm: FormGroup;
  editingCategory: any = null;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  loadCategories() {
    // TODO: Implement API call to get categories
    this.categories = [
      { id: 1, name: 'Office Supplies', description: 'General office supplies' },
      { id: 2, name: 'IT Equipment', description: 'Computer and tech equipment' }
    ];
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      if (this.editingCategory) {
        this.updateCategory();
      } else {
        this.addCategory();
      }
    }
  }

  addCategory() {
    // TODO: Implement API call to add category
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Category added successfully'
    });
    this.categoryForm.reset();
  }

  updateCategory() {
    // TODO: Implement API call to update category
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Category updated successfully'
    });
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  editCategory(category: any) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
  }

  deleteCategory(category: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this category?',
      accept: () => {
        // TODO: Implement API call to delete category
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Category deleted successfully'
        });
      }
    });
  }
} 