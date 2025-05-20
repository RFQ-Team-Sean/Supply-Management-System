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
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-item-group-dialog',
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
    ConfirmDialogModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [style]="{width: '50vw'}" 
      [modal]="true"
      header="Manage Item Groups">
      
      <div class="mb-4">
        <form [formGroup]="groupForm" (ngSubmit)="onSubmit()">
          <div class="flex gap-2">
            <div class="flex-grow">
              <input 
                pInputText 
                formControlName="name"
                placeholder="Enter group name"
                class="w-full"
              />
            </div>
            <div class="flex-grow">
              <p-dropdown
                [options]="categories"
                formControlName="categoryId"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Category"
                class="w-full"
              ></p-dropdown>
            </div>
            <p-button 
              type="submit" 
              [disabled]="!groupForm.valid"
              [label]="editingGroup ? 'Update' : 'Add'"
            ></p-button>
          </div>
        </form>
      </div>

      <p-table [value]="itemGroups" [scrollable]="true" scrollHeight="400px">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th style="width: 100px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-group>
          <tr>
            <td>{{group.name}}</td>
            <td>{{group.category}}</td>
            <td>
              <div class="flex gap-2">
                <button 
                  pButton 
                  icon="pi pi-pencil" 
                  class="p-button-rounded p-button-primary p-button-sm"
                  (click)="editGroup(group)"
                ></button>
                <button 
                  pButton 
                  icon="pi pi-trash" 
                  class="p-button-rounded p-button-danger p-button-sm"
                  (click)="deleteGroup(group)"
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
export class ItemGroupDialogComponent implements OnInit {
  visible: boolean = false;
  itemGroups: any[] = [];
  categories: any[] = [];
  groupForm: FormGroup;
  editingGroup: any = null;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadItemGroups();
    this.loadCategories();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  loadItemGroups() {
    // TODO: Implement API call to get item groups
    this.itemGroups = [
      { id: 1, name: 'Consumables', category: 'Office Supplies' },
      { id: 2, name: 'Hardware', category: 'IT Equipment' }
    ];
  }

  loadCategories() {
    // TODO: Implement API call to get categories
    this.categories = [
      { id: 1, name: 'Office Supplies' },
      { id: 2, name: 'IT Equipment' }
    ];
  }

  onSubmit() {
    if (this.groupForm.valid) {
      if (this.editingGroup) {
        this.updateGroup();
      } else {
        this.addGroup();
      }
    }
  }

  addGroup() {
    // TODO: Implement API call to add group
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item group added successfully'
    });
    this.groupForm.reset();
  }

  updateGroup() {
    // TODO: Implement API call to update group
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item group updated successfully'
    });
    this.editingGroup = null;
    this.groupForm.reset();
  }

  editGroup(group: any) {
    this.editingGroup = group;
    this.groupForm.patchValue({
      name: group.name,
      categoryId: group.categoryId
    });
  }

  deleteGroup(group: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item group?',
      accept: () => {
        // TODO: Implement API call to delete group
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Item group deleted successfully'
        });
      }
    });
  }
} 