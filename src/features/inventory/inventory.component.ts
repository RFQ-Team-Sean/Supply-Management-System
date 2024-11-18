import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../app/services/supabase.service';
import { InventoryItem } from '../../features/inventory/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  itemForm: FormGroup;
  isEditing = false;
  currentItemId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private fb: FormBuilder
  ) {
    this.itemForm = this.fb.group({
      item_name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      reorder_level: [0, [Validators.required, Validators.min(0)]],
      // Remove Validators.required and Validators.min(0) from created_at
      created_at: [null]
    });
  }

  async ngOnInit() {
    await this.loadInventoryItems();
  }

  async loadInventoryItems() {
    try {
      this.loading = true;
      this.inventoryItems = await this.supabase.getInventoryItems();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.itemForm.invalid) return;

    try {
      this.loading = true;

      // Automatically set the created_at field if adding a new item
      const formData = { ...this.itemForm.value };
      if (!this.isEditing) {
        formData.created_at = new Date().toISOString(); // Set created_at to the current date/time
      }

      if (this.isEditing && this.currentItemId) {
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
    this.currentItemId = item.id!;
    this.itemForm.patchValue(item);
  }

  async deleteItem(itemId: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;
  
    try {
      this.loading = true;
      await this.supabase.deleteInventoryItem(itemId); // Pass itemId to Supabase service
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