// src/app/pages/admin/item-classification/item-classification.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';

import { ItemClassificationService, ItemClassification } from 'src/app/services/item-classification.service';
import { GroupService, Group } from 'src/app/services/group.service';
import { Product, ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-item-classification',
  templateUrl: './item-classification.component.html',
  styleUrls: ['./item-classification.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TabViewModule,
    DropdownModule,
    MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class ItemClassificationComponent implements OnInit {
  groups: Group[] = [];
  classifications: ItemClassification[] = [];
  products: Product[] = [];
  loading = true;

  groupDialogVisible = false;
  classificationDialogVisible = false;
  groupForm: FormGroup;
  classificationForm: FormGroup;
  submitted = false;
  isEditMode = false;
  selectedId: string | null = null;

  constructor(
    private groupService: GroupService,
    private productsService: ProductsService,
    private itemClassificationService: ItemClassificationService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.groupForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      products: [[]]
    });

    this.classificationForm = this.formBuilder.group({
      category: ['', Validators.required],
      group: ['', Validators.required],
      description: ['']
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.groups = await this.groupService.getAllGroups();
    this.classifications = await this.itemClassificationService.getAllClassifications();
    this.products = await this.productsService.getAll();
    this.loading = false;
  }

  // Helper method to get product names by their IDs
  getProductName(productId: string): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  }

  openNewGroupDialog() {
    this.isEditMode = false;
    this.submitted = false;
    this.selectedId = null;
    this.groupDialogVisible = true;
    this.groupForm.reset();
  }

  editGroup(group: Group) {
    this.isEditMode = true;
    this.submitted = false;
    this.selectedId = group.id || null;
    this.groupDialogVisible = true;

    this.groupForm.patchValue({
      name: group.name,
      description: group.description,
      products: group.products || []
    });
  }

  deleteGroup(group: Group) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete '${group.name}'?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (group.id) {
            await this.groupService.deleteGroup(group.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Group deleted successfully'
            });
            await this.loadData();
          }
        } catch (err: any) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      }
    });
  }

  hideGroupDialog() {
    this.groupDialogVisible = false;
    this.submitted = false;
    this.groupForm.reset();
  }

  async saveGroup() {
    this.submitted = true;
    if (this.groupForm.valid) {
      const formValue = this.groupForm.value;
      try {
        if (this.isEditMode && this.selectedId) {
          const updated: Group = {
            ...formValue,
            id: this.selectedId
          };
          await this.groupService.updateGroup(updated);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Group updated'
          });
        } else {
          await this.groupService.addGroup(formValue);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Group created'
          });
        }
        this.groupDialogVisible = false;
        this.groupForm.reset();
        await this.loadData();
      } catch (err: any) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
      }
    }
  }

  openNewClassificationDialog() {
    this.isEditMode = false;
    this.submitted = false;
    this.selectedId = null;
    this.classificationDialogVisible = true;
    this.classificationForm.reset();
  }

  editClassification(classification: ItemClassification) {
    this.isEditMode = true;
    this.submitted = false;
    this.selectedId = classification.id || null;
    this.classificationDialogVisible = true;

    this.classificationForm.patchValue({
      category: classification.category,
      group: classification.group,
      description: classification.description
    });
  }

  deleteClassification(classification: ItemClassification) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete '${classification.category} - ${classification.group}'?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (classification.id) {
            await this.itemClassificationService.deleteClassification(classification.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Classification deleted successfully'
            });
            await this.loadData();
          }
        } catch (err: any) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      }
    });
  }

  hideClassificationDialog() {
    this.classificationDialogVisible = false;
    this.submitted = false;
    this.classificationForm.reset();
  }

  async saveClassification() {
    this.submitted = true;
    if (this.classificationForm.valid) {
      const formValue = this.classificationForm.value;
      try {
        if (this.isEditMode && this.selectedId) {
          const updated: ItemClassification = {
            ...formValue,
            id: this.selectedId
          };
          await this.itemClassificationService.updateClassification(updated);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Classification updated'
          });
        } else {
          await this.itemClassificationService.addClassification(formValue);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Classification created'
          });
        }
        this.classificationDialogVisible = false;
        this.classificationForm.reset();
        await this.loadData();
      } catch (err: any) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
      }
    }
  }
}