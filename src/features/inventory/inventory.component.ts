// inventory.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../app/services/supabase.service';
import { InventoryItem, InventoryStatus, ItemRequest } from './inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  itemForm!: FormGroup;
  requestForm!: FormGroup;
  isEditing = false;
  currentItemId: number | null = null;
  loading = false;
  error: string | null = null;
  categories: string[] = [];
  selectedCategory: string = 'all';
  showRequestForm = false;

  // Pagination
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  // Status options
  readonly statusOptions: InventoryStatus[] = ['Available', 'Out of Stock', 'Low Stock'];

  constructor(
    private supabase: SupabaseService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.itemForm = this.fb.group({
      item_number: ['', Validators.required],
      item_name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      category: ['', Validators.required],
      reorder_level: [0, [Validators.required, Validators.min(0)]],
      created_at: [null]
    });

    this.requestForm = this.fb.group({
      department: ['', Validators.required],
      item_name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      purpose: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadInventoryItems();
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get paginatedItems(): InventoryItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Request item methods
  toggleRequestForm() {
    this.showRequestForm = !this.showRequestForm;
    if (!this.showRequestForm) {
      this.requestForm.reset();
    }
  }

  async submitRequest() {
    if (this.requestForm.invalid) return;

    try {
      this.loading = true;
      await this.supabase.submitItemRequest({
        ...this.requestForm.value,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      this.toggleRequestForm();
      // Show success message
      alert('Request submitted successfully!');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  private updateCategories() {
    this.categories = [...new Set(this.inventoryItems.map(item => item.category))];
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredItems = this.inventoryItems;
    } else {
      this.filteredItems = this.inventoryItems.filter(item => item.category === category);
    }
    this.totalItems = this.filteredItems.length;
    this.currentPage = 1;
  }

  getStatus(item: InventoryItem): InventoryStatus {
    if (item.quantity <= 0) {
      return 'Out of Stock';
    } else if (item.quantity <= item.reorder_level) {
      return 'Low Stock';
    }
    return 'Available';
  }

  getStatusColor(status: InventoryStatus): string {
    switch (status) {
      case 'Available':
        return 'text-green-600';
      case 'Out of Stock':
        return 'text-red-600';
      case 'Low Stock':
        return 'text-yellow-600';
      default:
        return '';
    }
  }

  async loadInventoryItems() {
    try {
      this.loading = true;
      this.inventoryItems = await this.supabase.getInventoryItems();
      this.filteredItems = [...this.inventoryItems];  // Ensuring immutability
      this.totalItems = this.filteredItems.length;
      this.updateCategories();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  generateItemNumber(): string {
    const prefix = 'ITM';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  async onSubmit(event: Event) {
    event.preventDefault(); // Prevent form default submission
    if (this.itemForm.invalid) return;

    try {
      this.loading = true;

      const formData = { ...this.itemForm.value };
      if (!this.isEditing) {
        formData.created_at = new Date().toISOString();
        formData.item_number = this.generateItemNumber();
      }

      if (this.isEditing && this.currentItemId !== null) {
        await this.supabase.updateInventoryItem(this.currentItemId, formData);
      } else {
        await this.supabase.addInventoryItem(formData);
      }
      await this.loadInventoryItems();
      this.resetForm();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  editItem(item: InventoryItem) {
    this.isEditing = true;
    this.currentItemId = item.item_id ?? null;  // Handle null values safely
    this.itemForm.patchValue(item);
  }

  async deleteItem(itemId: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      this.loading = true;
      await this.supabase.deleteInventoryItem(itemId);
      await this.loadInventoryItems();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentItemId = null;
    this.itemForm.reset({
      quantity: 0,
      unit_price: 0,
      reorder_level: 0
    });
  }
}
