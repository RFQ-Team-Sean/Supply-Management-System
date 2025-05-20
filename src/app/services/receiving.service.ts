import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { CrudService } from './crud.service';
import { NotificationService } from './notifications.service';
import { 
  ALL_RECEIVING_DUMMY_DATA, 
  RECEIVING_DATA_VERSION, 
  SPECIAL_RECEIVING_DUMMY_DATA,
  SUPPLIES_RECEIVING_DUMMY_DATA,
  FIXED_ASSET_RECEIVING_DUMMY_DATA
} from '../schema/inventory-dummydata';
import { Items } from '../schema/schema';

export interface ReceivingItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  condition: string;
  donor?: string;
  receivedDate: Date;
  remarks?: string;
  status?: 'pending' | 'approved' | 'rejected';
  type: 'special' | 'regular' | 'supplies' | 'donation' | 'fixed_asset';
  department?: string;
  receivedBy?: string;
  receivedFrom?: string;
  // Additional fields for supplies
  category?: string;
  supplier?: string;
  expiryDate?: Date;
  storageLocation?: string;
  // Additional fields for fixed assets
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchasePrice?: number;
  location?: string;
  purchaseDate?: Date;
}

// Create a class for ReceivingItem to use with crudService
export class ReceivingItemClass implements ReceivingItem {
  id: string = '';
  itemName: string = '';
  description: string = '';
  quantity: number = 0;
  unit: string = '';
  condition: string = '';
  donor?: string;
  receivedDate: Date = new Date();
  remarks?: string;
  status?: 'pending' | 'approved' | 'rejected' = 'pending';
  type: 'special' | 'regular' | 'supplies' | 'donation' | 'fixed_asset' = 'special';
  department?: string;
  receivedBy?: string;
  receivedFrom?: string;
  category?: string;
  supplier?: string;
  expiryDate?: Date;
  storageLocation?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchasePrice?: number;
  location?: string;
  purchaseDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReceivingService {
  private apiUrl = `${environment.api}/receiving`;

  constructor(
    private http: HttpClient,
    private crudService: CrudService,
    private notifService: NotificationService
  ) {
    if (environment.use === 'local') {
      this.initializeLocalStorage();
    }
  }

  /**
   * Initialize localStorage with dummy data if needed
   */
  private initializeLocalStorage(): void {
    // Force reset localStorage on service initialization
    localStorage.removeItem('receiving_items');
    localStorage.removeItem('receiving_data_version');
    
    // Initialize with fresh dummy data
    localStorage.setItem('receiving_items', JSON.stringify(ALL_RECEIVING_DUMMY_DATA));
    localStorage.setItem('receiving_data_version', RECEIVING_DATA_VERSION);
    
    console.log(`Initialized ${ALL_RECEIVING_DUMMY_DATA.length} receiving items in localStorage`);
  }

  /**
   * Get all receiving items
   * @returns Promise<ReceivingItem[]> list of all receiving items
   */
  async getAll(): Promise<ReceivingItem[]> {
    if (environment.use === 'local') {
      const items = localStorage.getItem('receiving_items');
      if (!items) {
        localStorage.setItem('receiving_items', JSON.stringify(ALL_RECEIVING_DUMMY_DATA));
        return ALL_RECEIVING_DUMMY_DATA;
      }
      return JSON.parse(items);
    }
    
    try {
      // Use crudService for server operations
      const response = await this.crudService.getAll(ReceivingItemClass);
      return response || [];
    } catch (error) {
      console.error('Error fetching receiving items:', error);
      this.notifyError('Failed to fetch receiving items');
      throw error;
    }
  }

  /**
   * Get receiving items by type
   * @param type type of receiving items to get
   * @returns Promise<ReceivingItem[]> filtered list of receiving items
   */
  async getByType(type: 'special' | 'regular' | 'supplies' | 'donation' | 'fixed_asset'): Promise<ReceivingItem[]> {
    const items = await this.getAll();
    return items.filter(item => item.type === type);
  }

  /**
   * Add a new receiving item
   * @param item item to add
   * @returns Promise<ReceivingItem> newly added item
   */
  async addItem(item: Omit<ReceivingItem, 'id'>): Promise<ReceivingItem> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      const prefix = item.type === 'special' ? 'SR-' : 
                     item.type === 'supplies' ? 'SUP-' : 
                     item.type === 'fixed_asset' ? 'FA-' : 'RCV-';
      
      const newId = `${prefix}${Date.now().toString().substring(6)}`;
      const newItem: ReceivingItem = {
        ...item,
        id: newId
      };
      
      items.push(newItem);
      localStorage.setItem('receiving_items', JSON.stringify(items));
      console.log(`Added new ${item.type} receiving item with ID ${newId}`);
      
      this.notifySuccess('Item added successfully');
      return newItem;
    }

    try {
      // Use crudService for server operations
      const response = await this.crudService.create(ReceivingItemClass, item as any);
      this.notifySuccess('Item added successfully');
      return response;
    } catch (error) {
      console.error('Error adding receiving item:', error);
      this.notifyError('Failed to add item');
      throw error;
    }
  }

  /**
   * Update an existing receiving item
   * @param item item with updated data
   * @returns Promise<ReceivingItem> updated item
   */
  async updateItem(item: ReceivingItem): Promise<ReceivingItem> {
    if (!item.id) {
      throw new Error('Item ID is required');
    }

    if (environment.use === 'local') {
      const items = await this.getAll();
      const index = items.findIndex(i => i.id === item.id);
      
      if (index !== -1) {
        items[index] = item;
        localStorage.setItem('receiving_items', JSON.stringify(items));
        console.log(`Updated receiving item with ID ${item.id}`);
        
        this.notifySuccess('Item updated successfully');
        return item;
      }
      
      throw new Error('Item not found');
    }

    try {
      // Use crudService for server operations
      const response = await this.crudService.update(ReceivingItemClass, item.id, item as any);
      
      this.notifySuccess('Item updated successfully');
      return response;
    } catch (error) {
      console.error('Error updating item:', error);
      this.notifyError('Failed to update item');
      throw error;
    }
  }

  /**
   * Delete a receiving item
   * @param id ID of the item to delete
   * @returns Promise<ReceivingItem> deleted item
   */
  async deleteItem(id: string): Promise<ReceivingItem> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      const index = items.findIndex(i => i.id === id);
      
      if (index === -1) {
        throw new Error('Item not found');
      }
      
      const deletedItem = items.splice(index, 1)[0];
      localStorage.setItem('receiving_items', JSON.stringify(items));
      console.log(`Deleted receiving item with ID ${id}`);
      
      this.notifySuccess('Item deleted successfully');
      return deletedItem;
    }

    try {
      // Use crudService for server operations
      const response = await this.crudService.delete(ReceivingItemClass, id);
      
      if (!response) {
        throw new Error('Failed to delete item');
      }
      
      this.notifySuccess('Item deleted successfully');
      return response;
    } catch (error) {
      console.error('Error deleting item:', error);
      this.notifyError('Failed to delete item');
      throw error;
    }
  }

  /**
   * Approve a receiving item
   * @param id ID of the item to approve
   * @returns Promise<ReceivingItem> approved item
   */
  async approveItem(id: string): Promise<ReceivingItem> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      const item = items.find(i => i.id === id);
      
      if (item) {
        item.status = 'approved';
        await this.updateItem(item);
        
        // If it's a special item, add to inventory
        if (item.type === 'special') {
          await this.addToInventory(item);
        }
        
        this.notifySuccess('Item approved successfully');
        return item;
      }
      
      throw new Error('Item not found');
    }

    try {
      // Use crudService for server operations
      const response = await this.http.patch<ReceivingItem>(`${this.apiUrl}/${id}/approve`, {}).toPromise();
      
      if (!response) {
        throw new Error('Failed to approve item');
      }
      
      // If it's a special item, add to inventory
      if (response.type === 'special') {
        await this.addToInventory(response);
      }
      
      this.notifySuccess('Item approved successfully');
      return response;
    } catch (error) {
      console.error('Error approving item:', error);
      this.notifyError('Failed to approve item');
      throw error;
    }
  }

  /**
   * Reject a receiving item
   * @param id ID of the item to reject
   * @returns Promise<ReceivingItem> rejected item
   */
  async rejectItem(id: string): Promise<ReceivingItem> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      const item = items.find(i => i.id === id);
      
      if (item) {
        item.status = 'rejected';
        await this.updateItem(item);
        
        this.notifySuccess('Item rejected successfully');
        return item;
      }
      
      throw new Error('Item not found');
    }

    try {
      // Use crudService for server operations
      const response = await this.http.patch<ReceivingItem>(`${this.apiUrl}/${id}/reject`, {}).toPromise();
      
      if (!response) {
        throw new Error('Failed to reject item');
      }
      
      this.notifySuccess('Item rejected successfully');
      return response;
    } catch (error) {
      console.error('Error rejecting item:', error);
      this.notifyError('Failed to reject item');
      throw error;
    }
  }

  /**
   * Add an approved receiving item to the inventory
   * @param item approved receiving item to add to inventory
   */
  private async addToInventory(item: ReceivingItem): Promise<void> {
    try {
      // Get existing inventory items
      let inventoryItems: Items[] = [];
      
      if (environment.use === 'local') {
        const storedItems = localStorage.getItem('inventory_items');
        inventoryItems = storedItems ? JSON.parse(storedItems) : [];
      } else {
        // For server mode, would use crudService to get inventory items
        // This is a placeholder - actual implementation would depend on your backend
      }
      
      // Create new inventory item from receiving item
      const newInventoryItem: Items = {
        id: `INV-${Date.now().toString().substring(6)}`,
        product: item.itemName,
        barcode: `RCV-${item.id}`,
        warehouse: item.storageLocation || 'Main Storage',
        category: item.category || 'Donations',
        quantity: item.quantity,
        dateAdded: new Date(),
        description: item.description,
        minimumQty: Math.ceil(item.quantity * 0.1), // Set minimum to 10% of quantity
        unit: item.unit,
        status: 'Available',
        brand: item.manufacturer || '',
        subCategory: item.type
      };
      
      // Add to inventory items
      inventoryItems.push(newInventoryItem);
      
      // Save to localStorage if in local mode
      if (environment.use === 'local') {
        localStorage.setItem('inventory_items', JSON.stringify(inventoryItems));
        console.log(`Added item ${item.itemName} to inventory in ${newInventoryItem.warehouse}`);
        
        // Update warehouse data if available
        this.updateWarehouseData(newInventoryItem);
        
        // Dispatch an event to notify inventory system of the update
        this.dispatchInventoryUpdatedEvent();
      } else {
        // For server mode, would use crudService to create new inventory item
        // This is a placeholder - actual implementation would depend on your backend
      }
    } catch (error) {
      console.error('Error adding item to inventory:', error);
      throw error;
    }
  }
  
  /**
   * Update warehouse data with new inventory item
   * @param item The inventory item to add to the warehouse
   */
  private updateWarehouseData(item: Items): void {
    try {
      // Get warehouse data from localStorage
      const warehouseDataStr = localStorage.getItem('warehouseData');
      if (!warehouseDataStr) return;
      
      const warehouseData = JSON.parse(warehouseDataStr);
      
      // Find the warehouse to update
      const warehouse = warehouseData.find((w: any) => w.name === item.warehouse);
      if (!warehouse) return;
      
      // Check if the product already exists in the warehouse
      const existingProduct = warehouse.products?.find((p: any) => p.name === item.product);
      
      if (existingProduct) {
        // Update existing product quantity
        existingProduct.quantity += item.quantity;
      } else {
        // Add new product to warehouse
        if (!warehouse.products) warehouse.products = [];
        
        warehouse.products.push({
          name: item.product,
          image: 'assets/placeholder-product.png',
          quantity: item.quantity
        });
      }
      
      // Save updated warehouse data
      localStorage.setItem('warehouseData', JSON.stringify(warehouseData));
      console.log(`Updated warehouse ${warehouse.name} with ${item.quantity} units of ${item.product}`);
    } catch (error) {
      console.error('Error updating warehouse data:', error);
    }
  }

  /**
   * Helper method to show success notification
   * @param message Success message to display
   */
  private notifySuccess(message: string): void {
    // Use console.log as a fallback
    console.log(`SUCCESS: ${message}`);
    
    // Use NotificationService's addNotification method
    try {
      if (this.notifService && typeof this.notifService.addNotification === 'function') {
        this.notifService.addNotification(message, 'success');
      }
    } catch (e) {
      console.error('Error showing notification:', e);
    }
  }

  /**
   * Helper method to show error notification
   * @param message Error message to display
   */
  private notifyError(message: string): void {
    // Use console.error as a fallback
    console.error(`ERROR: ${message}`);
    
    // Use NotificationService's addNotification method
    try {
      if (this.notifService && typeof this.notifService.addNotification === 'function') {
        this.notifService.addNotification(message, 'error');
      }
    } catch (e) {
      console.error('Error showing notification:', e);
    }
  }

  /**
   * Dispatch an event to notify the inventory system of updates
   */
  private dispatchInventoryUpdatedEvent(): void {
    const event = new CustomEvent('inventory-updated');
    window.dispatchEvent(event);
    console.log('Dispatched inventory-updated event');
  }

  /**
   * Get receiving items by date range
   * @param startDate start date of range
   * @param endDate end date of range
   * @returns Promise<ReceivingItem[]> filtered list of receiving items
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<ReceivingItem[]> {
    const items = await this.getAll();
    return items.filter(item => {
      const itemDate = new Date(item.receivedDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  /**
   * Get receiving items by status
   * @param status status to filter by
   * @returns Promise<ReceivingItem[]> filtered list of receiving items
   */
  async getByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<ReceivingItem[]> {
    const items = await this.getAll();
    return items.filter(item => item.status === status);
  }

  /**
   * Submit a donated item from special receiving to inventory
   * @param item the receiving item to submit
   * @param warehouse the warehouse to store the item in
   * @returns Promise<boolean> success status
   */
  async submitItem(item: ReceivingItem, warehouse?: any): Promise<boolean> {
    try {
      // First approve the item
      const approvedItem = await this.approveItem(item.id);
      
      // If warehouse is specified, set storage location before adding to inventory
      if (warehouse) {
        approvedItem.storageLocation = warehouse.name;
      }
      
      // After successfully adding to inventory, delete from receiving list
      await this.deleteItem(item.id);
      
      // Successfully submitted
      this.notifySuccess('Item submitted to inventory successfully');
      return true;
    } catch (error) {
      console.error('Error submitting item to inventory:', error);
      this.notifyError('Failed to submit item to inventory');
      return false;
    }
  }
} 