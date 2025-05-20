import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { CrudService } from './crud.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeliveredStock, StockDetail, DeliveryStatus, DeliverySubStatus } from '../schema/schema';
import { RequestItem, RequestItemDetail } from '../schema/schema';
import { RequestItemService } from './request-item.service';
import { NotificationService } from './notifications.service';
import { deliveredStocks as dummyDeliveredStocks } from '../schema/inventory-dummydata';
import { UserService } from './user.service';

// Local storage key for delivered stocks
const DELIVERED_STOCKS_KEY = 'deliveredStocks';

// Define a class wrapper for DeliveredStock for CRUD service
class DeliveredStockClass implements DeliveredStock {
  id: string | number = '';
  supplier: string = '';
  receiptNo: number = 0;
  requisitionNumber: string = '';
  dateDelivered: Date = new Date();
  department: string = '';
  status: DeliveryStatus = 'Under Delivery';
  subStatus?: DeliverySubStatus;
  statusUpdateTime?: Date;
  requestedBy?: string;
  dateRequested?: Date;
  cancellationDate?: Date;
  remarks?: string;
  deliveryAddress?: string;
  details: StockDetail[] = [];
  poNumber?: number;
  division?: string;
  fundCluster?: string;
  approvedBy?: string;
  issuedBy?: string;
  cancelledBy?: string;
  cancellerPosition?: string;
  purpose?: string;
  returnedToInventory?: boolean;
  returnTime?: Date;
}

// Define a class wrapper for RequestItem for CRUD service
class RequestItemClass {
  id?: number;
  requestedBy: string = '';
  dateRequest: Date = new Date();
  department: string = '';
  itemCode: string = '';
  items: RequestItemDetail[] = [];
  status?: "Returned" | "Pending" | "Approved" | "Issued";
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  // BehaviorSubject to hold and emit delivered stocks
  private deliveredStocksSubject = new BehaviorSubject<DeliveredStock[]>([]);
  deliveredStocks$ = this.deliveredStocksSubject.asObservable();

  constructor(
    private crudService: CrudService,
    private requestItemService: RequestItemService,
    private notificationService: NotificationService,
    private userService: UserService
  ) {
    this.loadDeliveredStocks();
  }

  // Load delivered stocks from localStorage or server
  public async loadDeliveredStocks(): Promise<void> {
    if (environment.use === 'local') {
      const storedStocks = localStorage.getItem(DELIVERED_STOCKS_KEY);
      let stocks: DeliveredStock[] = [];
      
      if (storedStocks) {
        const parsedStocks = JSON.parse(storedStocks);
        // Convert date strings to Date objects
        stocks = parsedStocks.map((stock: any) => ({
          ...stock,
          dateDelivered: new Date(stock.dateDelivered),
          statusUpdateTime: stock.statusUpdateTime ? new Date(stock.statusUpdateTime) : undefined,
          dateRequested: stock.dateRequested ? new Date(stock.dateRequested) : undefined,
          cancellationDate: stock.cancellationDate ? new Date(stock.cancellationDate) : undefined,
          details: stock.details.map((detail: any) => ({
            ...detail,
            dateReceived: detail.dateReceived ? new Date(detail.dateReceived) : undefined
          }))
        }));
      } else {
        // If no stocks in localStorage, use the dummy data
        stocks = dummyDeliveredStocks.map(stock => ({
          ...stock,
          dateDelivered: new Date(stock.dateDelivered),
          dateRequested: stock.dateRequested ? new Date(stock.dateRequested) : undefined,
          details: stock.details.map(detail => ({
            ...detail,
            dateReceived: detail.dateReceived ? new Date(detail.dateReceived) : undefined
          }))
        }));
        // Save the dummy data to localStorage
        localStorage.setItem(DELIVERED_STOCKS_KEY, JSON.stringify(stocks));
      }
      
      this.deliveredStocksSubject.next(stocks);
    } else {
      try {
        // For server mode, we would use the real API
        const response = await this.crudService.getAll<DeliveredStock>(DeliveredStockClass);
        this.deliveredStocksSubject.next(response);
      } catch (error) {
        console.error('Error loading delivered stocks:', error);
        this.deliveredStocksSubject.next([]);
      }
    }
  }

  // Get all delivered stocks
  getAll(): Observable<DeliveredStock[]> {
    return this.deliveredStocks$;
  }

  // Convert a RequestItem to DeliveredStock format
  async deliverRequest(requestItem: RequestItem): Promise<DeliveredStock> {
    // Create StockDetail items from RequestItemDetail items
    const details: StockDetail[] = requestItem.items.map((item: RequestItemDetail) => ({
      id: item.id?.toString() || '',
      itemName: item.itemName,
      itemType: item.itemType,
      category: item.itemType,
      quantity: item.quantity,
      unit: item.unit || 'pcs',
      isVerified: false,
      deliveryStatus: 'Under Delivery',
      itemCode: item.stockNo || ''
    }));

    // Get delivery address from the dedicated field
    const deliveryAddress = requestItem.deliveryLocation || 'N/A';

    // Generate a receipt number (numeric)
    const receiptNumber = Date.now(); 

    // Create a new DeliveredStock object
    const deliveredStock: DeliveredStock = {
      id: `DEL-${Date.now()}`,
      supplier: requestItem.requestedBy || 'N/A', // Use requester as supplier for better tracking
      receiptNo: receiptNumber, // Numeric receipt number
      requisitionNumber: requestItem.itemCode, // Store the RIS number (with prefix)
      dateDelivered: new Date(),
      department: requestItem.department,
      status: 'Under Delivery',
      subStatus: 'In Transit',
      statusUpdateTime: new Date(),
      requestedBy: requestItem.requestedBy,
      dateRequested: requestItem.dateRequest,
      deliveryAddress: deliveryAddress,
      remarks: requestItem.remarks ? `Delivery initiated from request ${requestItem.itemCode}; ${requestItem.remarks}` : 
        `Delivery initiated from request ${requestItem.itemCode}`,
      details: details
    };

    if (environment.use === 'local') {
      // Get current delivered stocks
      const currentStocks = this.deliveredStocksSubject.value;
      // Add new delivered stock
      const updatedStocks = [...currentStocks, deliveredStock];
      // Save to localStorage
      localStorage.setItem(DELIVERED_STOCKS_KEY, JSON.stringify(updatedStocks));
      // Update subject
      this.deliveredStocksSubject.next(updatedStocks);

      // Remove the request item from the request items list
      // by deleting it from the RequestItemService
      await this.requestItemService.delete(requestItem.id!);
      
      // Reload delivered stocks to ensure sample data is included
      await this.loadDeliveredStocks();
    } else {
      // In server mode, use the CRUD service
      const deliveryData = { ...deliveredStock };
      delete (deliveryData as any).id; // Remove id for create operation
      
      await this.crudService.create(DeliveredStockClass, deliveryData as any);
      
      // Delete the request item - we need to use the actual type from schema.ts
      await this.crudService.delete(RequestItemClass, requestItem.id!.toString());
      
      // Refresh the stocks
      await this.loadDeliveredStocks();
    }

    // Use updateDeliveryStatus to send a proper notification
    await this.updateDeliveryStatus(deliveredStock.id.toString(), 'Under Delivery', 'In Transit');
    
    return deliveredStock;
  }

  // Update a delivered stock status
  async updateStatus(id: string | number, status: DeliveryStatus, remarks?: string): Promise<DeliveredStock> {
    if (environment.use === 'local') {
      const currentStocks = this.deliveredStocksSubject.value;
      const stockIndex = currentStocks.findIndex(stock => stock.id === id);
      
      if (stockIndex === -1) {
        throw new Error('Delivered stock not found');
      }
      
      const updatedStock = {
        ...currentStocks[stockIndex],
        status,
        statusUpdateTime: new Date(),
        remarks: remarks || currentStocks[stockIndex].remarks
      };
      
      const updatedStocks = [...currentStocks];
      updatedStocks[stockIndex] = updatedStock;
      
      localStorage.setItem(DELIVERED_STOCKS_KEY, JSON.stringify(updatedStocks));
      this.deliveredStocksSubject.next(updatedStocks);
      
      return updatedStock;
    } else {
      // In server mode, use the CRUD service
      const updatedStock = await this.crudService.partial_update(
        DeliveredStockClass,
        id.toString(),
        { status, statusUpdateTime: new Date(), remarks }
      );
      
      await this.loadDeliveredStocks();
      return updatedStock as DeliveredStock;
    }
  }

  // Update additional details of a delivered stock
  async updateDeliveryDetails(id: string | number, details: Partial<DeliveredStock>): Promise<DeliveredStock> {
    if (environment.use === 'local') {
      const currentStocks = this.deliveredStocksSubject.value;
      const stockIndex = currentStocks.findIndex(stock => stock.id === id);
      
      if (stockIndex === -1) {
        throw new Error('Delivered stock not found');
      }
      
      const updatedStock = {
        ...currentStocks[stockIndex],
        ...details,
        statusUpdateTime: new Date()
      };
      
      const updatedStocks = [...currentStocks];
      updatedStocks[stockIndex] = updatedStock;
      
      localStorage.setItem(DELIVERED_STOCKS_KEY, JSON.stringify(updatedStocks));
      this.deliveredStocksSubject.next(updatedStocks);
      
      return updatedStock;
    } else {
      // In server mode, use the CRUD service
      // Convert details to a format compatible with the CRUD service
      const updateData: any = {
        ...details,
        statusUpdateTime: new Date()
      };
      
      // Ensure receiptNo is a number if it exists in the update
      if (typeof updateData.receiptNo === 'string') {
        updateData.receiptNo = parseInt(updateData.receiptNo, 10);
      }
      
      const updatedStock = await this.crudService.partial_update(
        DeliveredStockClass,
        id.toString(),
        updateData
      );
      
      await this.loadDeliveredStocks();
      return updatedStock as DeliveredStock;
    }
  }

  // Get a specific delivered stock by ID
  async getById(id: string | number): Promise<DeliveredStock | undefined> {
    const currentStocks = this.deliveredStocksSubject.value;
    return currentStocks.find(stock => stock.id === id);
  }

  // Delete a delivered stock
  async delete(id: string | number): Promise<boolean> {
    if (environment.use === 'local') {
      const currentStocks = this.deliveredStocksSubject.value;
      const updatedStocks = currentStocks.filter(stock => stock.id !== id);
      
      localStorage.setItem(DELIVERED_STOCKS_KEY, JSON.stringify(updatedStocks));
      this.deliveredStocksSubject.next(updatedStocks);
      
      return true;
    } else {
      // In server mode, use the CRUD service
      await this.crudService.delete(DeliveredStockClass, id.toString());
      await this.loadDeliveredStocks();
      
      return true;
    }
  }

  // Create a delivery from a RequestItem without deleting the original request item
  async createFromRequestItem(requestItem: RequestItem): Promise<DeliveredStock> {
    if (!requestItem.isBeingDelivered) {
      requestItem.isBeingDelivered = true;
    }

    // Create StockDetail items from RequestItemDetail items
    const details: StockDetail[] = requestItem.items.map((item: RequestItemDetail) => ({
      id: item.id?.toString() || '',
      itemName: item.itemName,
      itemType: item.itemType,
      category: item.itemType,
      quantity: item.quantity,
      unit: item.unit || 'pcs',
      isVerified: false,
      deliveryStatus: 'Under Delivery',
      itemCode: item.stockNo || ''
    }));

    // Get delivery address from the dedicated field
    const deliveryAddress = requestItem.deliveryLocation || 'N/A';

    // Generate a receipt number (numeric)
    const receiptNumber = Date.now(); 

    // Create a new DeliveredStock object
    const deliveredStock: DeliveredStock = {
      id: `DEL-${Date.now()}`,
      supplier: requestItem.requestedBy || 'N/A',
      receiptNo: receiptNumber,
      requisitionNumber: requestItem.itemCode,
      dateDelivered: new Date(),
      department: requestItem.department,
      status: 'Under Delivery',
      subStatus: 'In Transit',
      statusUpdateTime: new Date(),
      requestedBy: requestItem.requestedBy,
      dateRequested: requestItem.dateRequest,
      deliveryAddress: deliveryAddress,
      remarks: requestItem.remarks ? `Delivery initiated from request ${requestItem.itemCode}; ${requestItem.remarks}` : 
        `Delivery initiated from request ${requestItem.itemCode}`,
      details: details,
      purpose: requestItem.purpose
    };

    if (environment.use === 'local') {
      // Get current delivered stocks
      const currentStocks = this.deliveredStocksSubject.value;
      // Add new delivered stock
      const updatedStocks = [...currentStocks, deliveredStock];
      // Save to localStorage
      localStorage.setItem(DELIVERED_STOCKS_KEY, JSON.stringify(updatedStocks));
      // Update subject
      this.deliveredStocksSubject.next(updatedStocks);
      
      // Reload delivered stocks to ensure data is properly updated
      await this.loadDeliveredStocks();
    } else {
      // In server mode, use the CRUD service
      const deliveryData = { ...deliveredStock };
      delete (deliveryData as any).id; // Remove id for create operation
      
      await this.crudService.create(DeliveredStockClass, deliveryData as any);
      
      // Refresh the stocks
      await this.loadDeliveredStocks();
    }

    // We'll use the updateDeliveryStatus method to send a proper notification instead
    await this.updateDeliveryStatus(deliveredStock.id.toString(), 'Under Delivery', 'In Transit');
    
    return deliveredStock;
  }

  /**
   * Return delivered items back to inventory without deleting the delivered stock record
   * @param deliveredStock The delivered stock to return to inventory
   * @returns A boolean indicating success
   */
  async addToInventoryWithoutDeletion(deliveredStock: DeliveredStock): Promise<boolean> {
    if (environment.use === 'local') {
      try {
        // Get current inventory items from localStorage
        const storedItems = localStorage.getItem('inventory_items');
        let inventoryItems = storedItems ? JSON.parse(storedItems) : [];

        // Convert delivered items to inventory format that matches what inventory-item component expects
        const returnedItems = deliveredStock.details.map(item => ({
          id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          product: item.itemName,
          category: item.category || item.itemType || 'General',
          subCategory: '',
          description: `Returned from delivery ${deliveredStock.receiptNo}`,
          status: 'In Stock',
          quantity: item.quantity,
          unit: item.unit,
          barcode: item.itemCode,
          minimumQty: 10, // Default minimum quantity
          brand: '',
          warehouse: deliveredStock.department || 'Main Warehouse',
          dateAdded: new Date(),
          imageUrl: ''
        }));

        // Check if items with the same barcode already exist
        for (const returnedItem of returnedItems) {
          const existingItemIndex = inventoryItems.findIndex((invItem: any) => 
            invItem.barcode === returnedItem.barcode && 
            invItem.product === returnedItem.product
          );

          if (existingItemIndex !== -1) {
            // If exists, increase quantity
            inventoryItems[existingItemIndex].quantity += returnedItem.quantity;
            
            // Update status if needed
            if (inventoryItems[existingItemIndex].quantity === 0) {
              inventoryItems[existingItemIndex].status = 'Out of Stock';
            } else if (inventoryItems[existingItemIndex].quantity < inventoryItems[existingItemIndex].minimumQty) {
              inventoryItems[existingItemIndex].status = 'Low Stock';
            } else {
              inventoryItems[existingItemIndex].status = 'In Stock';
            }
          } else {
            // If not exists, add as new item
            inventoryItems.push(returnedItem);
          }
        }

        // Save updated inventory to localStorage
        localStorage.setItem('inventory_items', JSON.stringify(inventoryItems));
        
        // Trigger inventory update event
        window.dispatchEvent(new CustomEvent('inventory-updated'));
        
        // Update the delivery status to indicate it has been returned to inventory
        await this.updateDeliveryDetails(deliveredStock.id, { 
          returnedToInventory: true,
          returnTime: new Date(),
          remarks: `${deliveredStock.remarks || ''}\nItems returned to inventory on ${new Date().toLocaleString()}`
        });
        
        return true;
      } catch (error) {
        console.error('Error returning items to inventory:', error);
        this.notificationService.addNotification('Failed to return items to inventory', 'error');
        return false;
      }
    } else {
      // In server mode, use the CRUD service
      try {
        // Convert the delivered items to a format suitable for the inventory
        const inventoryUpdates = deliveredStock.details.map(item => ({
          itemCode: item.itemCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          category: item.category || item.itemType || 'General',
          itemName: item.itemName,
          unit: item.unit,
          source: 'delivery_return',
          sourceId: deliveredStock.id,
          receiptNo: deliveredStock.receiptNo
        }));

        // Call the API to return items to inventory
        await this.crudService.create(
          { name: 'InventoryReturn' } as any,
          { 
            items: inventoryUpdates,
            deliveryId: deliveredStock.id,
            returnReason: deliveredStock.remarks || 'Returned to stock' 
          }
        );
        
        // Update the delivery status to indicate it has been returned to inventory
        await this.updateDeliveryDetails(deliveredStock.id, { 
          returnedToInventory: true,
          returnTime: new Date(),
          remarks: `${deliveredStock.remarks || ''}\nItems returned to inventory on ${new Date().toLocaleString()}`
        });
        
        return true;
      } catch (error) {
        console.error('Error returning items to inventory:', error);
        this.notificationService.addNotification('Failed to return items to inventory', 'error');
        return false;
      }
    }
  }

  /**
   * Update delivery status and notify requester
   */
  async updateDeliveryStatus(deliveryId: string, newStatus: DeliveryStatus, subStatus?: DeliverySubStatus): Promise<void> {
    const delivery = await this.getById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    // Update the delivery status
    delivery.status = newStatus;
    if (subStatus) {
      delivery.subStatus = subStatus;
    }

    // Save the updated delivery
    await this.updateStatus(delivery.id, delivery.status, delivery.remarks);

    // Send notification to the requester
    let notificationMessage = '';
    let notificationType: 'info' | 'success' | 'warning' | 'error' = 'info';
    
    // Get the current user (who is changing the status)
    const currentUser = this.userService.getUser();
    const actionByUser = currentUser?.fullname || currentUser?.username || 'Administrator';

    switch (newStatus) {
      case 'Completed':
        notificationMessage = `Your requested items (${delivery.requisitionNumber}) have been delivered successfully by ${actionByUser}.`;
        notificationType = 'success';
        break;
      case 'Under Delivery':
        notificationMessage = `Your requested items (${delivery.requisitionNumber}) are now out for delivery by ${actionByUser}.`;
        notificationType = 'info';
        break;
      case 'Incomplete':
        notificationMessage = `Your delivery (${delivery.requisitionNumber}) was marked as incomplete by ${actionByUser}. Please check the details.`;
        notificationType = 'warning';
        break;
      case 'Cancelled':
        notificationMessage = `Your delivery (${delivery.requisitionNumber}) has been cancelled by ${actionByUser}.`;
        notificationType = 'error';
        break;
      case 'Returned':
        notificationMessage = `Items from delivery (${delivery.requisitionNumber}) have been returned by ${actionByUser}.`;
        notificationType = 'warning';
        break;
    }

    // Use the requester's name for targeting the notification
    const requesterName = delivery.requestedBy;
    
    // Send notification to the specific requester
    if (requesterName) {
      this.notificationService.addNotification(
        notificationMessage,
        notificationType,
        requesterName
      );
    }
    
    // Also create a separate notification for administrators
    if (currentUser) {
      this.notificationService.addNotification(
        `You updated delivery ${delivery.requisitionNumber} to ${newStatus} status.`,
        'info',
        currentUser.username
      );
    }
  }
}