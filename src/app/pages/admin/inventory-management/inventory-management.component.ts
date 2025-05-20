import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ProductTypeDialogComponent } from './product-type-dialog/product-type-dialog.component';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { ItemGroupDialogComponent } from './item-group-dialog/item-group-dialog.component';
import { LottieAnimationComponent } from 'src/app/pages/ui-components/lottie-animation/lottie-animation.component';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    ConfirmPopupModule,
    BadgeModule,
    TooltipModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    ProductTypeDialogComponent,
    CategoryDialogComponent,
    ItemGroupDialogComponent,
    LottieAnimationComponent
  ]
})
export class InventoryManagementComponent implements OnInit {
  displayedColumns: string[] = ['itemCode', 'name', 'category', 'type', 'group', 'quantity', 'actions'];
  dataSource: any[] = [];
  loading: boolean = false;
  
  categories: string[] = [];
  productTypes: string[] = [];
  itemGroups: string[] = [];

  @ViewChild('dt1') dt1: any;
  @ViewChild('productTypeDialog') productTypeDialog!: ProductTypeDialogComponent;
  @ViewChild('categoryDialog') categoryDialog!: CategoryDialogComponent;
  @ViewChild('itemGroupDialog') itemGroupDialog!: ItemGroupDialogComponent;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadInventoryData();
    this.loadCategories();
    this.loadProductTypes();
    this.loadItemGroups();
  }

  loadInventoryData() {
    // Implement API call to get inventory data
  }

  loadCategories() {
    // Implement API call to get categories
  }

  loadProductTypes() {
    // Implement API call to get product types
  }

  loadItemGroups() {
    // Implement API call to get item groups
  }

  openAddEditDialog(item?: any) {
    // Implement dialog for adding/editing items
  }

  openCategoryDialog() {
    this.categoryDialog.show();
  }

  openProductTypeDialog() {
    this.productTypeDialog.show();
  }

  openItemGroupDialog() {
    this.itemGroupDialog.show();
  }

  onGlobalFilter(event: any) {
    if (this.dt1) {
      this.dt1.filterGlobal(event.target?.value || '', 'contains');
    }
  }

  deleteItem(item: any) {
    // Implement delete logic
    console.log('Deleting item:', item);
  }
}