import { Injectable } from '@angular/core';
import { z } from 'zod';
import { productSchema, Product } from './products.service';

// Define the supplier schema using Zod
export const supplierSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  name: z.string().min(1, "Supplier name is required"), // Ensuring the name is not empty
  contactPerson: z.string().min(1, "Contact person is required"), // Contact person for the supplier
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits").optional(), // Optional contact number
  email: z.string().email("Invalid email address").optional(), // Optional email
  address: z.string().max(255, "Address cannot exceed 255 characters").optional(), // Optional address
  productsSupplied: z.array(productSchema).optional(), // List of products supplied
  dateAdded: z.date().optional(), // Optional date the supplier was added
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(), // Optional additional notes
});

// TypeScript type inferred from the Zod schema
export type Supplier = z.infer<typeof supplierSchema>;

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private supplierData: Supplier[] = [
    {
      id: '12345678901234567890123456789012',
      name: 'Tech Supplies Co.',
      contactPerson: 'John Doe',
      contactNumber: '1234567890',
      email: 'techsupplies@example.com',
      address: '123 Tech Street, Silicon Valley, CA',
      productsSupplied: [
        {
          id: '12345678901234567890123456789012',
          name: 'Wireless Mouse',
          sku: 'MOUSE001',
          description: 'Ergonomic wireless mouse with adjustable DPI settings.',
          dateAdded: new Date('2023-06-15'),
          category: 'Electronics',
        },
        {
          id: '23456789012345678901234567890123',
          name: 'Gaming Keyboard',
          sku: 'KEYBOARD001',
          description: 'Mechanical keyboard with RGB lighting and custom keys.',
          dateAdded: new Date('2023-05-10'),
          category: 'Electronics',
        },
      ],
      dateAdded: new Date('2023-06-15'),
      notes: 'Preferred supplier for IT equipment',
    },
    {
      id: '23456789012345678901234567890123',
      name: 'Office Essentials Ltd.',
      contactPerson: 'Jane Smith',
      contactNumber: '0987654321',
      email: 'officeessentials@example.com',
      address: '456 Office Lane, New York, NY',
      productsSupplied: [
        {
          id: '34567890123456789012345678901234',
          name: 'Office Chair',
          sku: 'CHAIR001',
          description: 'Comfortable office chair with adjustable height and lumbar support.',
          dateAdded: new Date('2023-04-05'),
          category: 'Furniture',
        },
      ],
      dateAdded: new Date('2023-01-10'),
      notes: 'Provides bulk discounts for stationery',
    },
  ];

  constructor() {}

  /**
   * Fetch all suppliers from local storage or the default list
   * @returns Promise<Supplier[]>
   */
  async getAll(): Promise<Supplier[]> {
    const localSuppliers = localStorage.getItem('suppliers');
    if (localSuppliers) {
      this.supplierData = JSON.parse(localSuppliers) as Supplier[];
    }
    return this.supplierData;
  }

  /**
   * Add a new supplier
   * @param supplier The supplier to add
   */
  async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<void> {
    const id = this.generateId();
    const newSupplier: Supplier = {
      id,
      ...supplier,
      dateAdded: supplier.dateAdded ?? new Date(),
    };
    this.supplierData.push(newSupplier);
    this.saveToLocalStorage();
  }

  /**
   * Edit an existing supplier
   * @param updatedSupplier The updated supplier
   */
  async editSupplier(updatedSupplier: Supplier): Promise<void> {
    const index = this.supplierData.findIndex((s) => s.id === updatedSupplier.id);
    if (index !== -1) {
      this.supplierData[index] = updatedSupplier;
      this.saveToLocalStorage();
    }
  }

  /**
   * Delete a supplier
   * @param id ID of the supplier to delete
   */
  async deleteSupplier(id: string): Promise<void> {
    this.supplierData = this.supplierData.filter((s) => s.id !== id);
    this.saveToLocalStorage();
  }

  /**
   * Generate a unique ID for a new supplier
   * @returns string
   */
  private generateId(): string {
    return (Math.random() + 1).toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Save suppliers to localStorage
   */
  private saveToLocalStorage(): void {
    localStorage.setItem('suppliers', JSON.stringify(this.supplierData));
  }

  async resetSuppliers(): Promise<void> {
  localStorage.removeItem('suppliers');  // Remove just suppliers
  this.supplierData = [];  // Reset the in-memory array
}
}
