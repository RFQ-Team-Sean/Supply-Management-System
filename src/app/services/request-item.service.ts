import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { CrudService } from './crud.service';
import { NotificationService } from './notifications.service';
import { UserService } from './user.service';
import { RequestItem, RequestItemDetail } from '../schema/schema';

// Immediately log that this service is loading
console.log('*** RequestItemService is being loaded ***');

// Version control for local storage
export const REQUEST_ITEM_DATA_VERSION = '1.0.0';

// Initial dummy data for local mode
const INITIAL_REQUEST_ITEMS: RequestItem[] = [
  {
    id: 1,
    itemCode: 'RIS-20240501001',
    codeNumber: 'STK-001',
    department: 'IT Department',
    requestedBy: 'John Doe',
    deliveryLocation: 'IT Department, Admin Building, Floor 2',
    dateRequest: new Date('2024-05-01'),
    dateApproved: new Date('2024-05-02'),
    status: 'Pending',
    purpose: 'For project development',
    approvedBy: 'Alice Johnson',
    approverPosition: 'Manager',
    items: [
      {
        id: 1,
        stockNo: 'BAR001',
        itemName: 'Lenovo IdeaPad 3',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 2,
        availableQuantity: 50,
        stockAvailable: 'yes',
        issueQuantity: 2,
        remarks: ''
      },
      {
        id: 2,
        stockNo: 'BAR004',
        itemName: 'HP LaserJet Printer',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 1,
        availableQuantity: 25,
        stockAvailable: 'yes',
        issueQuantity: 1,
        remarks: ''
      }
    ]
  },
  {
    id: 2,
    itemCode: 'RIS-20240502001',
    codeNumber: 'STK-002',
    department: 'HR Department',
    requestedBy: 'Jane Smith',
    deliveryLocation: 'HR Department, Admin Building, Floor 1',
    dateRequest: new Date('2024-05-02'),
    dateApproved: new Date('2024-05-03'),
    status: 'Approved',
    purpose: 'Office furniture setup',
    approvedBy: 'Bob Williams',
    approverPosition: 'Director',
    items: [
      {
        id: 3,
        stockNo: 'BAR002',
        itemName: 'Office Desk Chair',
        itemType: 'Furniture',
        unit: 'Units',
        quantity: 5,
        availableQuantity: 30,
        stockAvailable: 'yes',
        issueQuantity: 5,
        remarks: ''
      }
    ]
  },
  {
    id: 3,
    itemCode: 'RIS-20240503001',
    codeNumber: 'STK-003',
    department: 'Marketing Department',
    requestedBy: 'Michael Brown',
    deliveryLocation: 'Marketing Department, Admin Building, Floor 3',
    dateRequest: new Date('2024-05-03'),
    dateApproved: new Date('2024-05-04'),
    status: 'Issued',
    purpose: 'Office supplies',
    approvedBy: 'Catherine Green',
    approverPosition: 'HR Manager',
    dateIssued: new Date('2024-05-05'),
    issuedBy: 'James Wilson',
    issuerPosition: 'Supply Officer',
    items: [
      {
        id: 4,
        stockNo: 'BAR003',
        itemName: 'Premium Notebook Set',
        itemType: 'Stationery',
        unit: 'Sets',
        quantity: 10,
        availableQuantity: 100,
        stockAvailable: 'yes',
        issueQuantity: 10,
        remarks: ''
      }
    ]
  },
  {
    id: 4,
    itemCode: 'RIS-20240504001',
    codeNumber: 'STK-004',
    department: 'Finance Department',
    requestedBy: 'Robert Johnson',
    deliveryLocation: 'Finance Department, Admin Building, Floor 3',
    dateRequest: new Date('2024-05-04'),
    dateApproved: new Date('2024-05-05'),
    status: 'Issued',
    purpose: 'Software licenses for new employees',
    approvedBy: 'Diana Prince',
    approverPosition: 'Finance Manager',
    dateIssued: new Date('2024-05-06'),
    issuedBy: 'Peter Parker',
    issuerPosition: 'Supply Officer',
    items: [
      {
        id: 5,
        stockNo: 'BAR005',
        itemName: 'Windows 11 Pro License',
        itemType: 'Software',
        unit: 'Licenses',
        quantity: 5,
        availableQuantity: 75,
        stockAvailable: 'yes',
        issueQuantity: 5,
        remarks: ''
      }
    ]
  },
  {
    id: 5,
    itemCode: 'RIS-20240505001',
    codeNumber: 'STK-005',
    department: 'IT Department',
    requestedBy: 'Sarah Wilson',
    deliveryLocation: 'IT Department, Admin Building, Floor 2',
    dateRequest: new Date('2024-05-05'),
    dateApproved: new Date('2024-05-06'),
    status: 'Returned',
    purpose: 'Temporary project needs',
    remarks: 'Items returned in good condition',
    approvedBy: 'Ethan Hunt',
    approverPosition: 'Operations Manager',
    dateIssued: new Date('2024-05-07'),
    issuedBy: 'Tony Stark',
    issuerPosition: 'Supply Officer',
    items: [
      {
        id: 6,
        stockNo: 'BAR001',
        itemName: 'Lenovo IdeaPad 3',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 1,
        availableQuantity: 50,
        stockAvailable: 'yes',
        issueQuantity: 1,
        remarks: ''
      }
    ]
  },
];

@Injectable({
  providedIn: 'root'
})
export class RequestItemService {
  private apiUrl = `${environment.api}/request_items`;
  
  // Observable sources and streams for real-time updates
  private requestItemsSubject = new BehaviorSubject<RequestItem[]>([]);
  public requestItems$ = this.requestItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private crudService: CrudService,
    private notificationService: NotificationService,
    private userService: UserService
  ) {
    this.initializeData();
    // Set up live updates if needed
    if (environment.use !== 'local') {
      this.setupLiveUpdates();
    }
  }

  private initializeData(): void {
    if (environment.use === 'local') {
      const storedVersion = localStorage.getItem('request_items_version');
      
      // Update data if version is different or doesn't exist
      if (!storedVersion || storedVersion !== REQUEST_ITEM_DATA_VERSION) {
        localStorage.setItem('request_items', JSON.stringify(INITIAL_REQUEST_ITEMS));
        localStorage.setItem('request_items_version', REQUEST_ITEM_DATA_VERSION);
      }
      
      // Load initial data
      this.loadRequestItems();
    } else {
      // For server mode, initially fetch data
      this.getAll().then(items => {
        this.requestItemsSubject.next(items);
      });
    }
  }

  private setupLiveUpdates(): void {
    // Subscribe to real-time updates from the server using the RequestItem type name
    this.crudService.live({name: 'RequestItem'} as any).subscribe(
      () => {
        // When changes occur, refresh the data
        this.getAll().then(items => {
          this.requestItemsSubject.next(items);
        });
      }
    );
  }

  private loadRequestItems(): void {
    // Load data from localStorage
    const storedItems = localStorage.getItem('request_items');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        // Convert date strings to Date objects
        const formattedItems = items.map((item: any) => ({
          ...item,
          dateRequest: new Date(item.dateRequest),
          dateApproved: item.dateApproved ? new Date(item.dateApproved) : undefined,
          dateIssued: item.dateIssued ? new Date(item.dateIssued) : undefined,
          dateDelivered: item.dateDelivered ? new Date(item.dateDelivered) : undefined
        }));
        this.requestItemsSubject.next(formattedItems);
      } catch (e) {
        console.error('Error parsing request items from localStorage:', e);
        this.requestItemsSubject.next([]);
      }
    }
  }

  /**
   * Get all request items
   */
  async getAll(): Promise<RequestItem[]> {
    if (environment.use === 'local') {
      const storedItems = localStorage.getItem('request_items');
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          // Convert date strings to Date objects
          return items.map((item: any) => ({
            ...item,
            dateRequest: new Date(item.dateRequest),
            dateApproved: item.dateApproved ? new Date(item.dateApproved) : undefined,
            dateIssued: item.dateIssued ? new Date(item.dateIssued) : undefined,
            dateDelivered: item.dateDelivered ? new Date(item.dateDelivered) : undefined
          }));
        } catch (e) {
          console.error('Error parsing request items from localStorage:', e);
          return [];
        }
      }
      return [];
    } else {
      try {
        // Use the CrudService to fetch data from the server with the type name
        return await this.crudService.getAll({name: 'RequestItem'} as any);
      } catch (error) {
        console.error('Error fetching request items:', error);
        this.notificationService.addNotification('Failed to fetch request items', 'error');
        return [];
      }
    }
  }

  /**
   * Get request items by status
   */
  async getByStatus(status: 'Pending' | 'Approved' | 'Returned' | 'Issued'): Promise<RequestItem[]> {
    const allItems = await this.getAll();
    return allItems.filter(item => item.status === status);
  }

  /**
   * Get request items by department
   */
  async getByDepartment(departmentName: string): Promise<RequestItem[]> {
    const allItems = await this.getAll();
    return allItems.filter(item => item.department === departmentName);
  }

  /**
   * Get a single request item by ID
   */
  async getById(id: number): Promise<RequestItem | undefined> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      return items.find(item => item.id === id);
    } else {
      try {
        // Use the CrudService to get a specific item
        return await this.crudService.get({name: 'RequestItem'} as any, id.toString());
      } catch (error) {
        console.error(`Error fetching request item with ID ${id}:`, error);
        this.notificationService.addNotification('Failed to fetch request item details', 'error');
        return undefined;
      }
    }
  }

  /**
   * Create a new request item
   */
  async create(requestItem: Omit<RequestItem, 'id'>): Promise<RequestItem> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      const newId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;
      
      const newItem: RequestItem = {
        ...requestItem,
        id: newId
      };
      
      const updatedItems = [...items, newItem];
      localStorage.setItem('request_items', JSON.stringify(updatedItems));
      this.requestItemsSubject.next(updatedItems);
      
      return newItem;
    } else {
      try {
        // Use the CrudService to create a new item
        const newItem = await this.crudService.create({name: 'RequestItem'} as any, requestItem);
        
        return newItem;
      } catch (error) {
        console.error('Error creating request item:', error);
        this.notificationService.addNotification('Failed to create request item', 'error');
        throw error;
      }
    }
  }

  /**
   * Update an existing request item
   */
  async update(id: number, updatedData: Partial<RequestItem>): Promise<RequestItem | undefined> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        this.notificationService.addNotification('Request item not found', 'error');
        return undefined;
      }
      
      const updatedItem: RequestItem = {
        ...items[index],
        ...updatedData
      };
      
      // If marking as being delivered, ensure status is 'Issued'
      if (updatedData.isBeingDelivered) {
        updatedItem.status = 'Issued';
      }
      
      items[index] = updatedItem;
      localStorage.setItem('request_items', JSON.stringify(items));
      this.requestItemsSubject.next(items);
      
      return updatedItem;
    } else {
      try {
        // Use the CrudService to update an item with proper type casting
        const updatedItem = await this.crudService.partial_update({name: 'RequestItem'} as any, id.toString(), updatedData) as RequestItem;
        
        return updatedItem;
      } catch (error) {
        console.error(`Error updating request item with ID ${id}:`, error);
        this.notificationService.addNotification('Failed to update request item', 'error');
        throw error;
      }
    }
  }

  /**
   * Delete a request item
   */
  async delete(id: number): Promise<boolean> {
    if (environment.use === 'local') {
      const items = await this.getAll();
      const filteredItems = items.filter(item => item.id !== id);
      
      if (filteredItems.length === items.length) {
        this.notificationService.addNotification('Request item not found', 'error');
        return false;
      }
      
      localStorage.setItem('request_items', JSON.stringify(filteredItems));
      this.requestItemsSubject.next(filteredItems);
      this.notificationService.addNotification('Request item deleted successfully', 'success');
      return true;
    } else {
      try {
        // Use the CrudService to delete an item
        await this.crudService.delete({name: 'RequestItem'} as any, id.toString());
        this.notificationService.addNotification('Request item deleted successfully', 'success');
        return true;
      } catch (error) {
        console.error(`Error deleting request item with ID ${id}:`, error);
        this.notificationService.addNotification('Failed to delete request item', 'error');
        return false;
      }
    }
  }

  /**
   * Change the status of a request item
   */
  async changeStatus(id: number, newStatus: 'Pending' | 'Approved' | 'Returned' | 'Issued', remarks?: string): Promise<RequestItem | undefined> {
    try {
      console.log(`NOTIFICATION DEBUG: Changing status for request ID ${id} to ${newStatus}`);
      console.log(`NOTIFICATION DEBUG: Current timestamp: ${new Date().toISOString()}`);
      
      const updateData: Partial<RequestItem> = { status: newStatus };
      
      // Get the request item before updating to get requester info
      const requestItem = await this.getById(id);
      if (!requestItem) {
        console.error(`Request item with ID ${id} not found`);
        throw new Error('Request item not found');
      }
      
      console.log(`Found request item:`, {
        id: requestItem.id,
        itemCode: requestItem.itemCode,
        requestedBy: requestItem.requestedBy,
        department: requestItem.department,
        status: requestItem.status
      });
  
      // Add date info based on new status
      if (newStatus === 'Approved') {
        updateData.dateApproved = new Date();
      } else if (newStatus === 'Issued') {
        updateData.dateIssued = new Date();
        
        // Update inventory quantities when issuing items
        await this.updateInventoryQuantities(requestItem);
      }
      
      // Add remarks if provided
      if (remarks) {
        updateData.remarks = remarks;
      }
  
      // Update the request
      console.log(`Updating request with data:`, updateData);
      const updatedRequest = await this.update(id, updateData);
      console.log(`Request updated successfully:`, updatedRequest?.status);
  
      // During debugging, uncomment this part to test notifications
      /*
      console.log(`FORCE TEST: Creating test notification for status change to ${newStatus}`);
      this.notificationService.addNotification(
        `TEST NOTIFICATION: Status changed to ${newStatus} for request ID ${id}`,
        'info',
        'debug-only' // Use a debug identifier that won't match any real user
      );
      */
  
      // Send notification to the requester
      if (updatedRequest) {
        let notificationMessage = '';
        let notificationType: 'info' | 'success' | 'warning' | 'error' = 'info';
  
        // Get the current user (who is changing the status)
        const currentUser = this.userService.getUser();
        console.log(`Current user:`, {
          username: currentUser?.username,
          fullname: currentUser?.fullname,
          role: currentUser?.role
        });
        
        const actionByUser = currentUser?.fullname || currentUser?.username || 'Administrator';
  
        switch (newStatus) {
          case 'Approved':
            notificationMessage = `Your request (${requestItem.itemCode}) has been approved by ${actionByUser}.`;
            notificationType = 'success';
            break;
          case 'Returned':
            notificationMessage = `Your request (${requestItem.itemCode}) has been returned by ${actionByUser}. Reason: ${remarks || 'No reason provided'}`;
            notificationType = 'warning';
            break;
          case 'Issued':
            notificationMessage = `Your requested items (${requestItem.itemCode}) have been issued by ${actionByUser} and are ready for delivery.`;
            notificationType = 'success';
            break;
          default:
            notificationMessage = `Your request (${requestItem.itemCode}) status has been updated to ${newStatus} by ${actionByUser}.`;
        }
  
              // Find the username that exactly matches the requester's name 
      // Ideally, we should have a user ID instead of relying on the name
      // For now, use the requester's name for targeting
      const requesterName = requestItem.requestedBy;
      console.log(`Creating notification for requester "${requesterName}": ${notificationMessage}`);
      
      // Target notification specifically to the requester
      console.log(`Creating notification: "${notificationMessage}" (type: ${notificationType})`);
      this.notificationService.addNotification(
        notificationMessage,
        notificationType,
        requesterName // Set the toUserId to the requester's name
      );
        
        // Verify the notification was saved
        setTimeout(() => {
          const storedJson = localStorage.getItem('notifications_data');
          const parsedList = storedJson ? JSON.parse(storedJson) : [];
          console.log(`After adding approval notification: ${parsedList.length} notifications in localStorage`);
          console.log('Current notifications:', parsedList.map((n: any) => n.message));
        }, 100);
        
        console.log(`Notification created successfully`);
        
              // Also create a separate notification for administrators
      // This notifies the admin of the action they just took
      if (currentUser) {
        console.log(`Creating notification for admin "${currentUser.username}"`);
        this.notificationService.addNotification(
          `You ${newStatus.toLowerCase()} ${requestItem.itemCode} for ${requesterName} (${requestItem.department}).`,
          'info',
          currentUser.username // Target specifically to the admin who took the action
        );
      }
      }
      
      return updatedRequest;
    } catch (error) {
      console.error('ERROR in changeStatus method:', error);
      
      // Create an error notification to verify notification service is working
      this.notificationService.addNotification(
        `Error updating request status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
      
      throw error; // Re-throw the error so callers are aware
    }
  }

  /**
   * Updates inventory quantities when items are issued
   * @param requestItem The request item being issued
   */
  private async updateInventoryQuantities(requestItem: RequestItem): Promise<void> {
    if (!requestItem.items || requestItem.items.length === 0) {
      console.log('No items to update inventory quantities for');
      return;
    }

    console.log('Updating inventory quantities for request:', requestItem.itemCode);
    console.log('Request item details:', {
      id: requestItem.id,
      itemCode: requestItem.itemCode,
      status: requestItem.status,
      itemCount: requestItem.items?.length
    });
    
    if (environment.use === 'local') {
      // Handle local storage update
      const storedItems = localStorage.getItem('inventory_items');
      if (!storedItems) {
        console.error('No inventory items found in localStorage');
        return;
      }

      try {
        const inventoryItems = JSON.parse(storedItems);
        console.log(`Found ${inventoryItems.length} inventory items in localStorage`);
        let updated = false;
        
        // Pre-validate the items to ensure they all have issueQuantity where needed
        for (const item of requestItem.items) {
          if (item.stockAvailable === 'yes' && (!item.issueQuantity && item.issueQuantity !== 0)) {
            console.warn(`Item ${item.itemName} (${item.stockNo}) is missing issueQuantity. Setting to default value.`);
            // Set issueQuantity to requested quantity or available quantity, whichever is lower
            item.issueQuantity = Math.min(item.quantity || 0, item.availableQuantity || 0);
          }
        }

        // Log all items that will be updated
        const itemsToUpdate = requestItem.items.filter(item => item.stockNo && (item.issueQuantity !== undefined && item.issueQuantity !== null));
        console.log('Items to update:', itemsToUpdate.map(item => ({
          name: item.itemName,
          stockNo: item.stockNo,
          issueQty: item.issueQuantity,
          available: item.availableQuantity,
          stockAvailable: item.stockAvailable
        })));

        // Update quantities for each requested item
        for (const item of requestItem.items) {
          if (!item.stockNo) {
            console.log(`Skipping item ${item.itemName}: No stockNo specified`);
            continue;
          }
          
          if (item.issueQuantity === undefined || item.issueQuantity === null) {
            console.log(`Skipping item ${item.itemName}: stockNo=${item.stockNo}, issueQuantity=${item.issueQuantity}`);
            continue;
          }

          // Find matching inventory item by barcode/stockNo
          const inventoryIndex = inventoryItems.findIndex((invItem: any) => 
            invItem.barcode === item.stockNo
          );

          if (inventoryIndex !== -1) {
            // Get current values for logging
            const oldQty = inventoryItems[inventoryIndex].quantity;
            const issueQty = item.issueQuantity;
            
            // Reduce the quantity
            const newQty = Math.max(0, oldQty - issueQty);
            
            // Update the inventory item
            inventoryItems[inventoryIndex].quantity = newQty;
            
            // Update status if needed based on minimumQty
            const minQty = inventoryItems[inventoryIndex].minimumQty || 0;
            if (newQty <= minQty && newQty > 0) {
              inventoryItems[inventoryIndex].status = 'Low Stock';
            } else if (newQty === 0) {
              inventoryItems[inventoryIndex].status = 'Out of Stock';
            }

            updated = true;
            console.log(`Updated inventory item "${item.itemName}" (${item.stockNo}): ${oldQty} -> ${newQty} (issued: ${issueQty})`);
          } else {
            console.warn(`Inventory item with barcode ${item.stockNo} not found for item ${item.itemName}`);
          }
        }

        if (updated) {
          // Save back to localStorage
          localStorage.setItem('inventory_items', JSON.stringify(inventoryItems));
          console.log('Updated inventory quantities in localStorage');
          
          // Verify the save by reading back
          const verifyItems = localStorage.getItem('inventory_items');
          if (verifyItems) {
            const parsedItems = JSON.parse(verifyItems);
            console.log(`Verification: ${parsedItems.length} items in localStorage after update`);
            
            // Check a few items that were updated
            for (const item of itemsToUpdate) {
              if (item.stockNo) {
                const verifyItem = parsedItems.find((invItem: any) => invItem.barcode === item.stockNo);
                if (verifyItem) {
                  console.log(`Verified item ${item.itemName} (${item.stockNo}): quantity=${verifyItem.quantity}, status=${verifyItem.status}`);
                }
              }
            }
          }
          
          // Force a refresh of the request items to notify subscribers
          // This will trigger the inventory component to reload
          this.loadRequestItems();
          
          // Dispatch a custom event to notify components that inventory has changed
          window.dispatchEvent(new CustomEvent('inventory-updated'));
        } else {
          console.warn('No inventory items were updated');
        }
      } catch (error) {
        console.error('Error updating inventory quantities:', error);
      }
    } else {
      // Handle server mode - use a hypothetical API endpoint for updating inventory
      try {
        // Prepare the inventory updates
        const updates = requestItem.items
          .filter(item => item.stockNo && item.issueQuantity)
          .map(item => ({
            barcode: item.stockNo,
            quantityDeduction: item.issueQuantity
          }));

        if (updates.length > 0) {
          // In a real implementation, this would call the server API
          // For example:
          // await this.http.post(`${this.apiUrl}/update-inventory`, { updates }).toPromise();
          
          // Using CrudService as an alternative approach
          await this.crudService.create(
            { name: 'InventoryUpdate' } as any, 
            { itemUpdates: updates, requestId: requestItem.id }
          );
          
          console.log('Updated inventory quantities on server');
          
          // Force a refresh of the request items to notify subscribers
          this.loadRequestItems();
          
          // Dispatch a custom event to notify components that inventory has changed
          window.dispatchEvent(new CustomEvent('inventory-updated'));
        } else {
          console.warn('No inventory updates to send to server');
        }
      } catch (error) {
        console.error('Error updating inventory quantities on server:', error);
        this.notificationService.addNotification('Failed to update inventory quantities', 'error');
      }
    }
  }

  /**
   * Create a request from inventory item
   */
  async createFromInventory(inventoryRequest: any): Promise<RequestItem> {
    // Check if this is a multiple item request
    const hasMultipleItems = inventoryRequest.items && Array.isArray(inventoryRequest.items) && inventoryRequest.items.length > 0;
    
    // Prepare the items array
    let requestItems: RequestItemDetail[] = [];
    
    if (hasMultipleItems) {
      // Convert the multiple items format
      requestItems = inventoryRequest.items.map((item: any, index: number) => ({
        id: Math.floor(Math.random() * 10000) + index + 1, // Generate a random ID for each item
        itemName: item.itemName,
        itemType: item.itemType || 'General', // Set a default if missing
        unit: item.unitOfMeasurement,
        quantity: item.quantityRequested,
        availableQuantity: item.product?.quantity || item.quantity || 0,
        stockAvailable: (item.product?.quantity > 0 || item.quantity > 0) ? 'yes' : 'no',
        stockNo: item.barcode || (item.product?.barcode || '') // Get barcode either directly or from product object
      }));
    } else {
      // Single item format (backward compatibility)
      requestItems = [{
        id: Math.floor(Math.random() * 10000) + 1, // Generate a random ID for the item
        itemName: inventoryRequest.itemName,
        itemType: typeof inventoryRequest.type === 'object' ? inventoryRequest.type.name : inventoryRequest.type,
        unit: inventoryRequest.unitOfMeasurement,
        quantity: inventoryRequest.quantityRequested,
        availableQuantity: inventoryRequest.quantity || 0, // Use inventory quantity as available
        stockAvailable: inventoryRequest.quantity > 0 ? 'yes' : 'no',
        stockNo: inventoryRequest.barcode || '' // Add stock number to item detail
      }];
    }
    
    // Transform inventory request to RequestItem format
    const requestItem: Omit<RequestItem, 'id'> = {
      itemCode: inventoryRequest.requestId || `RIS-${Date.now()}`, // RIS number
      codeNumber: hasMultipleItems ? 'MULTI-ITEM' : (inventoryRequest.barcode || ''), // Stock number from inventory
      department: inventoryRequest.requesterDepartment,
      requestedBy: inventoryRequest.requesterName,
      dateRequest: new Date(),
      status: 'Pending',
      purpose: inventoryRequest.remarks || inventoryRequest.reasonForRequest || 'Requested from inventory',
      items: requestItems,
      // Store the delivery location in the dedicated deliveryLocation field
      deliveryLocation: inventoryRequest.deliveryLocation || '',
      remarks: inventoryRequest.remarks || inventoryRequest.reasonForRequest || undefined
    };
    
    // Create the request item
    const createdItem = await this.create(requestItem);
    
    // If in local mode, ensure the item is immediately available in the subject
    if (environment.use === 'local') {
      // Refresh the request items list to ensure the new item is included
      this.loadRequestItems();
    }
    
    return createdItem;
  }

  /**
   * Resubmit a previously returned request
   * @param returnedRequest The original returned request to resubmit
   * @param updatedData Any fields that should be updated in the resubmission
   * @returns The newly created request item
   */
  async resubmitReturnedRequest(returnedRequest: RequestItem, updatedData: Partial<RequestItem>): Promise<RequestItem> {
    if (returnedRequest.status !== 'Returned') {
      throw new Error('Only returned requests can be resubmitted');
    }

    console.log('Resubmitting returned request:', returnedRequest.id, 'with updates:', updatedData);

    // Create a copy of the request with updated fields
    const resubmission: Omit<RequestItem, 'id'> = {
      // Preserve original item code
      itemCode: returnedRequest.itemCode,
      codeNumber: returnedRequest.codeNumber,
      
      // Update user information if provided, otherwise keep original
      department: updatedData.department || returnedRequest.department,
      requestedBy: updatedData.requestedBy || returnedRequest.requestedBy,
      
      // Update purpose if provided, otherwise keep original
      purpose: updatedData.purpose || returnedRequest.purpose,
      
      // Always set a fresh request date
      dateRequest: new Date(),
      
      // Always reset status to Pending
      status: 'Pending',
      
      // Keep delivery location if it exists
      deliveryLocation: updatedData.deliveryLocation || returnedRequest.deliveryLocation,
      
      // Use updated items if provided, otherwise use original items
      items: updatedData.items || returnedRequest.items,
      
      // Add reference to original request
      previousRequestId: returnedRequest.id,
      
      // Track that this is a resubmission
      isResubmission: true,
      
      // Store original return remarks for reference
      originalReturnRemarks: returnedRequest.remarks
    };

    console.log('Creating new resubmission with status:', resubmission.status);

    // Create the new request
    let newRequest: RequestItem;
    
    if (environment.use === 'local') {
      // In local mode, we need to create a new entry in localStorage
      const items = await this.getAll();
      const newId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;
      
      newRequest = {
        ...resubmission,
        id: newId
      };
      
      // Remove the original returned request
      const filteredItems = items.filter(item => item.id !== returnedRequest.id);
      
      // Add the new request
      const updatedItems = [...filteredItems, newRequest];
      
      // Save to localStorage
      localStorage.setItem('request_items', JSON.stringify(updatedItems));
      this.requestItemsSubject.next(updatedItems);
      
      console.log('Resubmitted request created in local mode with ID:', newRequest.id, 'and status:', newRequest.status);
      console.log('Original returned request with ID:', returnedRequest.id, 'has been removed');
    } else {
      try {
        // In server mode, first create the new request
        newRequest = await this.create(resubmission);
        console.log('Resubmitted request created in server mode with ID:', newRequest.id, 'and status:', newRequest.status);
        
        // Then delete the original returned request
        if (returnedRequest.id) {
          await this.delete(returnedRequest.id);
          console.log('Original returned request with ID:', returnedRequest.id, 'has been deleted from server');
        }
      } catch (error) {
        console.error('Error during resubmission process:', error);
        throw error;
      }
    }
    
    // Add a notification
    this.notificationService.addNotification('Request resubmitted successfully', 'success');
    
    // Ensure the request is immediately available in the subject
    this.loadRequestItems();
    
    return newRequest;
  }
} 