// src/app/services/item-classification.service.ts

import { Injectable } from '@angular/core';
import { z } from 'zod';

export const itemClassificationSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  category: z.string().min(1, "Category name is required"),
  group: z.string().min(1, "Group name is required"),
  description: z.string().max(500).optional(),
  products: z.array(z.string()).optional(), // Array of product IDs
});

export type ItemClassification = z.infer<typeof itemClassificationSchema>;

@Injectable({
  providedIn: 'root'
})
export class ItemClassificationService {
  private readonly STORAGE_KEY = 'item_classifications';
  private classifications: ItemClassification[] = [];

  constructor() {
    this.loadFromLocalStorage();
    if (!this.classifications.length) {
      this.loadDummyData();
    }
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.classifications = JSON.parse(stored);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.classifications));
  }

  private generate32CharId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private loadDummyData(): void {
    const dummy: ItemClassification[] = [
      {
        id: this.generate32CharId(),
        category: 'Electronics',
        group: 'Computers',
        description: 'Laptops, Desktops, and related equipment.',
      },
      {
        id: this.generate32CharId(),
        category: 'Furniture',
        group: 'Office Chairs',
        description: 'Comfortable chairs for office use.',
      }
    ];
    this.classifications = dummy;
    this.saveToLocalStorage();
  }

  async getAllClassifications(): Promise<ItemClassification[]> {
    return this.classifications;
  }

  async addClassification(data: Omit<ItemClassification, 'id'>): Promise<void> {
    const newItem: ItemClassification = {
      ...data,
      id: this.generate32CharId()
    };
    itemClassificationSchema.parse(newItem);
    this.classifications.push(newItem);
    this.saveToLocalStorage();
  }

  async updateClassification(item: ItemClassification): Promise<void> {
    itemClassificationSchema.parse(item);
    const index = this.classifications.findIndex(c => c.id === item.id);
    if (index === -1) {
      throw new Error('Classification not found');
    }
    this.classifications[index] = item;
    this.saveToLocalStorage();
  }

  async deleteClassification(id: string): Promise<void> {
    this.classifications = this.classifications.filter(c => c.id !== id);
    this.saveToLocalStorage();
  }
}