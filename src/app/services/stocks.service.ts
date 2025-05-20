import { Injectable } from '@angular/core';
import { z } from 'zod';
import { Items } from 'src/app/schema/schema';
import { CrudService } from './crud.service';
import { environment } from 'src/environment/environment';

export const stockSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  dr_id: z.string().length(10, 'Receipt ID is required').optional(),
  storage_id: z.string().min(1, 'Storage ID is required').optional(),
  storage_name: z.string().min(1, 'Storage name is required').optional(),
  product_id: z.string().min(1, 'Product ID is required').optional(),
  product_name: z.string().min(1, 'Product name is required').optional(),
  name: z.string().min(1, "Name is required"),
  ticker: z.string().min(1, "Ticker symbol is required"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().int().min(0, "Quantity must be a non-negative integer"),
  dateAdded: z.date().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  qrs: z.array(z.string()).optional(),
  status: z.enum(['pending', 'delivered', 'Approved', 'Rejected', 'Pending']).optional(),
});

export type Stock = z.infer<typeof stockSchema>;

interface DeliveryRequest {
  id: string;
  stockId: string;
  quantity: number;
  deliveryAddress: string;
  requestedDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

interface ReturnRequest {
  id: string;
  stockId: string;
  quantity: number;
  returnDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface FixedAssetRequest {
  id: string;
  assetId: string;
  transferTo: string;
  transferDate: Date;
  status: 'pending' | 'completed';
}

interface StockTransferRequest {
  id: string;
  fromStockId: string;
  toStockId: string;
  quantity: number;
  transferDate: Date;
  status: 'pending' | 'completed';
}

interface SuppliesIssuanceRequest {
  id: string;
  stockId: string;
  quantity: number;
  issuedDate: Date;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DeliveryAddress {
  id: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PropertyBorrowingRequest {
  id: string;
  assetId: string;
  borrower: string;
  borrowDate: Date;
  returnDate: Date | null;
  status: 'pending' | 'approved' | 'returned';
}

@Injectable({
  providedIn: 'root',
})
export class StocksService {
  private stockData: Stock[] = [
    {
      id: '12345678901234567890123456789012',
      name: 'Tesla Inc.',
      ticker: 'TSLA',
      price: 800.25,
      quantity: 10,
      dateAdded: new Date('2023-06-15'),
      description: 'Electric vehicle manufacturer.',
      dr_id: 'REC0012351',
    },
    {
      id: '98765432109876543210987654321098',
      name: 'Apple Inc.',
      ticker: 'AAPL',
      price: 145.30,
      quantity: 50,
      dateAdded: new Date('2022-11-30'),
      description: 'Technology company, creator of iPhones.',
      dr_id: 'REC0012351',
    },
    // Add the rest of the existing stocks here...
  ];
  private deliveryRequests: DeliveryRequest[] = [];
  private returnRequests: ReturnRequest[] = [];
  private fixedAssetRequests: FixedAssetRequest[] = [];
  private stockTransferRequests: StockTransferRequest[] = [];
  private suppliesIssuanceRequests: SuppliesIssuanceRequest[] = [];
  private deliveryAddresses: DeliveryAddress[] = [];
  private propertyBorrowingRequests: PropertyBorrowingRequest[] = [];

  constructor(private crudService: CrudService) {}

  async getAll(): Promise<Stock[]> {
    const local_stocks = localStorage.getItem('stocks');
    if (local_stocks) {
      this.stockData = JSON.parse(local_stocks) as Stock[];
    }
    return this.stockData;
  }

  async addStock(stock: Stock): Promise<string> {
    const id = (Math.random().toString(36) + Math.random().toString(36) + Date.now().toString(36)).substring(2, 34);
    this.stockData.push({ ...stock, id });
    localStorage.setItem('stocks', JSON.stringify(this.stockData));
    return id;
  }

  async editStock(stock: Stock): Promise<void> {
    const stockIndex = this.stockData.findIndex((item) => item.id === stock.id);
    this.stockData[stockIndex] = stock;
    localStorage.setItem('stocks', JSON.stringify(this.stockData));
  }

  async deleteStock(id: string): Promise<void> {
    this.stockData = this.stockData.filter((item) => item.id !== id);
    localStorage.setItem('stocks', JSON.stringify(this.stockData));
  }

  // New Methods

  async getInventoryCount(): Promise<{ name: string; ticker: string; quantity: number }[]> {
    return this.stockData.map((stock) => ({
      name: stock.name,
      ticker: stock.ticker,
      quantity: stock.quantity,
    }));
  }

  async createDeliveryRequest(stockId: string, quantity: number, deliveryAddress: string): Promise<DeliveryRequest> {
    const newRequest: DeliveryRequest = {
      id: (Math.random().toString(36) + Date.now().toString(36)).substring(2, 16),
      stockId,
      quantity,
      deliveryAddress,
      requestedDate: new Date(),
      status: 'pending',
    };
    this.deliveryRequests.push(newRequest);
    return newRequest;
  }

  async createReturnRequest(stockId: string, quantity: number, reason: string): Promise<ReturnRequest> {
    const newRequest: ReturnRequest = {
      id: (Math.random().toString(36) + Date.now().toString(36)).substring(2, 16),
      stockId,
      quantity,
      returnDate: new Date(),
      reason,
      status: 'pending',
    };
    this.returnRequests.push(newRequest);
    return newRequest;
  }

  async createFixedAssetRequest(assetId: string, transferTo: string): Promise<FixedAssetRequest> {
    const newRequest: FixedAssetRequest = {
      id: (Math.random().toString(36) + Date.now().toString(36)).substring(2, 16),
      assetId,
      transferTo,
      transferDate: new Date(),
      status: 'pending',
    };
    this.fixedAssetRequests.push(newRequest);
    return newRequest;
  }

  async createStockTransferRequest(fromStockId: string, toStockId: string, quantity: number): Promise<StockTransferRequest> {
    const newRequest: StockTransferRequest = {
      id: (Math.random().toString(36) + Date.now().toString(36)).substring(2, 16),
      fromStockId,
      toStockId,
      quantity,
      transferDate: new Date(),
      status: 'pending',
    };
    this.stockTransferRequests.push(newRequest);
    return newRequest;
  }

  async createSuppliesIssuanceRequest(stockId: string, quantity: number, purpose: string): Promise<SuppliesIssuanceRequest> {
    const newRequest: SuppliesIssuanceRequest = {
      id: (Math.random().toString(36) + Date.now().toString(36)).substring(2, 16),
      stockId,
      quantity,
      issuedDate: new Date(),
      purpose,
      status: 'pending',
    };
    this.suppliesIssuanceRequests.push(newRequest);
    return newRequest;
  }

  async generateDeliveryAddress(address: DeliveryAddress): Promise<DeliveryAddress> {
    const newAddress: DeliveryAddress = { ...address, id: (Math.random().toString(36) + Date.now().toString(36)).substring(2, 16) };
    this.deliveryAddresses.push(newAddress);
    return newAddress;
  }

  async createPropertyBorrowingRequest(assetId: string, borrower: string): Promise<PropertyBorrowingRequest> {
    const newRequest: PropertyBorrowingRequest = {
      id: (Math.random().toString(36) + Date.now().toString(36)).substring(2, 16),
      assetId,
      borrower,
      borrowDate: new Date(),
      returnDate: null,
      status: 'pending',
    };
    this.propertyBorrowingRequests.push(newRequest);
    return newRequest;
  }

  // Helper method to check if the application is in local mode
  private isLocalMode(): boolean {
    return environment.use === 'local';
  }

  /**
   * Converts stocks to inventory items and adds them to the inventory
   * Works in both local and server modes
   */
  async addToInventory(stocks: Stock[], deliveryReceiptId: string): Promise<Items[]> {
    console.log(`Processing ${stocks.length} stocks for inventory addition`);
    
    // Convert stocks to inventory items format
    const inventoryItems: Items[] = stocks.map(stock => {
      const newItem = new Items();
      newItem.id = stock.id || this.generateInventoryId();
      newItem.product = stock.name;
      newItem.warehouse = stock.storage_name || '';
      newItem.category = stock.product_name || '';
      newItem.quantity = stock.quantity;
      newItem.description = stock.description || `Added from DR ${stock.dr_id}`;
      newItem.barcode = stock.ticker || `BAR${stock.id || this.generateInventoryId()}`;
      newItem.minimumQty = 0;
      newItem.unit = 'pcs';
      newItem.status = 'Active';
      newItem.brand = '';
      newItem.subCategory = '';
      
      // Ensure dateAdded is a proper Date object
      if (stock.dateAdded instanceof Date) {
        newItem.dateAdded = stock.dateAdded;
      } else if (stock.dateAdded) {
        // Convert string to Date if needed
        newItem.dateAdded = new Date(stock.dateAdded);
      } else {
        newItem.dateAdded = new Date();
      }
      
      return newItem;
    });

    // Handle based on environment mode
    if (this.isLocalMode()) {
      try {
        console.log('Running in local mode, managing localStorage');
        
        // First, get any existing items from localStorage
        const existingItemsJson = localStorage.getItem('inventory_items');
        let existingItems: Items[] = [];
        
        if (existingItemsJson) {
          try {
            // Parse and ensure dates are handled properly
            const parsedItems = JSON.parse(existingItemsJson);
            
            // Convert dateAdded strings back to Date objects
            existingItems = parsedItems.map((item: any) => {
              if (item.dateAdded && typeof item.dateAdded === 'string') {
                item.dateAdded = new Date(item.dateAdded);
              }
              return item;
            });
            
            console.log(`Found ${existingItems.length} existing inventory items in localStorage`);
          } catch (e) {
            console.error('Error parsing inventory items from localStorage:', e);
            existingItems = [];
          }
        } else {
          console.log('No existing inventory items found in localStorage, importing dummy data');
          // Import dummy data directly
          const { inventoryItems: dummyItems } = await import('src/app/schema/inventory-dummydata');
          existingItems = [...dummyItems];
          console.log(`Loaded ${existingItems.length} items from dummy data`);
        }
        
        // Create a map of existing items by ID for efficient lookup and to preserve uniqueness
        const itemsMap = new Map<string, Items>();
        
        // Add existing items to the map
        existingItems.forEach(item => {
          if (item.id) {
            itemsMap.set(item.id, item);
          }
        });
        
        // Add new items to the map (will replace any with same ID)
        inventoryItems.forEach(item => {
          if (item.id) {
            itemsMap.set(item.id, item);
          }
        });
        
        // Convert map back to array
        const combinedItems = Array.from(itemsMap.values());
        
        console.log(`Saving total of ${combinedItems.length} inventory items to localStorage`);
        
        // Test local storage to check if we can save successfully
        try {
          const testKey = 'inventory_items_test';
          const testValue = JSON.stringify([inventoryItems[0]]);
          localStorage.setItem(testKey, testValue);
          const testResult = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          console.log('Local storage test successful:', !!testResult);
        } catch (storageError) {
          console.error('Local storage test failed:', storageError);
        }
        
        // Save the combined items to localStorage
        localStorage.setItem('inventory_items', JSON.stringify(combinedItems));
        
        // Double-check that items were saved successfully
        const savedItems = localStorage.getItem('inventory_items');
        console.log('Items saved successfully to localStorage:', !!savedItems);
        
        if (savedItems) {
          try {
            const parsedSavedItems = JSON.parse(savedItems);
            console.log(`Verified ${parsedSavedItems.length} items in localStorage`);
          } catch (e) {
            console.error('Error verifying saved items:', e);
          }
        }
        
        return inventoryItems;
      } catch (error) {
        console.error('Error adding items to inventory:', error);
        throw error;
      }
    } else {
      // Server implementation - add each item using CRUD service
      const addedItems: Items[] = [];
      for (const item of inventoryItems) {
        try {
          const addedItem = await this.crudService.create(Items, item);
          addedItems.push(addedItem);
        } catch (error) {
          console.error('Error adding inventory item:', error);
          throw error;
        }
      }
      return addedItems;
    }
  }

  // Helper method to generate a unique ID for inventory items
  private generateInventoryId(): string {
    return (Math.random().toString(36) + Math.random().toString(36) + Date.now().toString(36)).substring(2, 34);
  }
}
