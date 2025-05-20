import { Injectable } from '@angular/core';
import { z } from 'zod';
import { GroupService } from './group.service';

export const productSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  dateAdded: z.date().optional(),
  category: z.string().min(1, "Category is required"),
});


export type Product = z.infer<typeof productSchema>;

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly STORAGE_KEY = 'products';
 
  private productData: Product[] = [
  {
    id: '12345678901234567890123456789012',
    name: 'Wireless Mouse',
    sku: 'MOUSE001',
    description: 'Ergonomic wireless mouse with adjustable DPI settings',
    dateAdded: new Date('2023-06-15'),
    category: 'Electronics'
  },
  {
    id: '23456789012345678901234567890123',
    name: 'Gaming Keyboard',
    sku: 'KEYBOARD001',
    description: 'Mechanical keyboard with RGB lighting and custom keys',
    dateAdded: new Date('2023-05-10'),
    category: 'Electronics'
  },
  {
    id: '34567890123456789012345678901234',
    name: 'Office Chair',
    sku: 'CHAIR001',
    description: 'Comfortable office chair with adjustable height and lumbar support',
    dateAdded: new Date('2023-04-05'),
    category: 'Furniture'
  },
  {
    id: '45678901234567890123456789012345',
    name: 'Laptop Stand',
    sku: 'STAND001',
    description: 'Aluminum laptop stand with adjustable angles',
    dateAdded: new Date('2023-03-20'),
    category: 'Accessories'
  },
  {
    id: '56789012345678901234567890123456',
    name: 'Noise-Cancelling Headphones',
    sku: 'HEADPHONES001',
    description: 'Over-ear noise-cancelling headphones with Bluetooth connectivity',
    dateAdded: new Date('2023-02-15'),
    category: 'Electronics'
  },
  {
    id: '67890123456789012345678901234567',
    name: 'Standing Desk',
    sku: 'DESK001',
    description: 'Height-adjustable standing desk with memory presets',
    dateAdded: new Date('2023-01-10'),
    category: 'Furniture'
  },
  {
    id: '78901234567890123456789012345678',
    name: 'Smartphone Holder',
    sku: 'HOLDER001',
    description: 'Flexible smartphone holder for desks and beds',
    dateAdded: new Date('2023-07-01'),
    category: 'Accessories'
  },
  {
    id: '89012345678901234567890123456789',
    name: 'Monitor Stand',
    sku: 'MSTAND001',
    description: 'Adjustable monitor stand with cable management',
    dateAdded: new Date('2023-07-05'),
    category: 'Accessories'
  },
  {
    id: '90123456789012345678901234567890',
    name: 'Webcam',
    sku: 'WEBCAM001',
    description: 'HD webcam with built-in microphone and auto-focus',
    dateAdded: new Date('2023-07-10'),
    category: 'Electronics'
  },
  {
    id: '01234567890123456789012345678901',
    name: 'Filing Cabinet',
    sku: 'CABINET001',
    description: 'Metal filing cabinet with lock and multiple drawers',
    dateAdded: new Date('2023-07-15'),
    category: 'Furniture'
  },
  {
    id: 'abcdef1234567890abcdef1234567890',
    name: 'Desk Pad',
    sku: 'DPAD001',
    description: 'Large desk pad with edge stitching and non-slip base',
    dateAdded: new Date('2023-07-20'),
    category: 'Accessories'
  },
  {
    id: 'bcdef1234567890abcdef1234567891',
    name: 'Document Scanner',
    sku: 'SCANNER001',
    description: 'High-speed document scanner with automatic feed',
    dateAdded: new Date('2023-07-25'),
    category: 'Electronics'
  },
  {
    id: 'cdef1234567890abcdef1234567892',
    name: 'Bookshelf',
    sku: 'SHELF001',
    description: 'Adjustable bookshelf with multiple compartments',
    dateAdded: new Date('2023-07-30'),
    category: 'Furniture'
  },
  {
    id: 'def1234567890abcdef1234567893',
    name: 'Cable Management Kit',
    sku: 'CABLE001',
    description: 'Complete cable management solution with ties and sleeves',
    dateAdded: new Date('2023-08-01'),
    category: 'Accessories'
  },
  {
    id: 'ef1234567890abcdef1234567894',
    name: 'Wireless Keyboard',
    sku: 'WKEY001',
    description: 'Slim wireless keyboard with multi-device support',
    dateAdded: new Date('2023-08-05'),
    category: 'Electronics'
  }
];

  constructor(private groupService: GroupService) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedProducts = localStorage.getItem(this.STORAGE_KEY);
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        this.productData = parsedProducts.map((product: any) => ({
          ...product,
          dateAdded: product.dateAdded ? new Date(product.dateAdded) : undefined
        }));
      } catch (error) {
        console.error('Error loading products from localStorage:', error);
        this.resetToDefaultData();
      }
    } else {
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.productData));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }

  private resetToDefaultData(): void {
    this.saveToLocalStorage();
  }

  private generate32CharId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  async getAll(): Promise<Product[]> {
    return this.productData;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.productData.find(product => product.id === id);
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    try {
      const newProduct: Product = {
        ...product,
        id: this.generate32CharId(),
        dateAdded: new Date()
      };

      // productSchema.parse(newProduct);
      this.productData.push(newProduct);
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
    }
  }

  // Changed method name from updateProduct to editProduct to match component usage
  async editProduct(product: Product): Promise<void> {
    try {
      // productSchema.parse(product);
      const index = this.productData.findIndex(p => p.id === product.id);
      
      if (index === -1) {
        throw new Error('Product not found');
      }

      this.productData[index] = {
        ...product,
        dateAdded: this.productData[index].dateAdded
      };
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const initialLength = this.productData.length;
      this.productData = this.productData.filter(product => product.id !== id);
      
      if (this.productData.length === initialLength) {
        throw new Error('Product not found');
      }

      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  async getProductsByGroup(groupId: string): Promise<Product[]> {
    try {
      const group = await this.groupService.getGroupById(groupId);
      
      if (!group) {
        console.warn('Group not found:', groupId);
        return [];
      }

      if (!group.products || !Array.isArray(group.products)) {
        console.warn('No products defined for group:', groupId);
        return [];
      }

      const filteredProducts = this.productData.filter(product => 
        product.id && group.products?.includes(product.id)
      );

      console.log(`Found ${filteredProducts.length} products for group ${groupId}`);
      return filteredProducts;

    } catch (error) {
      console.error('Error in getProductsByGroup:', error);
      throw new Error('Failed to load products for the selected group');
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.productData.filter(product => product.category === category);
  }

  async resetProducts(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.loadFromLocalStorage();
    } catch (error) {
      console.error('Error resetting products:', error);
      throw new Error('Failed to reset products');
    }
  }
}