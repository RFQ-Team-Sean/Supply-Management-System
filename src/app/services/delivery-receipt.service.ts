//src\app\services\delivery-receipt.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { CrudService } from './crud.service';
import { NotificationService } from './notifications.service';
import { StocksService } from './stocks.service';
import { UserService } from './user.service';
import { Stock } from './stocks.service';
import { DeliveryReceipt } from '../schema/schema';
import { DELIVERY_RECEIPTS, DELIVERY_RECEIPT_DATA_VERSION } from '../schema/delivery-receipt-dummy';
import { PurchaseOrder, PurchaseOrderService } from './purchase-order.service';
import { Requisition, RequisitionService } from './requisition.service';

// Re-export DeliveryReceipt for backward compatibility
export {DeliveryReceipt} from '../schema/schema';

export type DeliveryReceiptItems = {
  deliveryReceipt: DeliveryReceipt,
  items: Stock[],
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryReceiptService {
  private apiUrl = `${environment.api}/delivery_receipts`;

  constructor(
    private http: HttpClient,
    private crudService: CrudService,
    private notifService: NotificationService,
    private stockService: StocksService,
    private userService: UserService,
    private purchaseOrderService: PurchaseOrderService,
    private requisitionService: RequisitionService
  ) {
    if (environment.use === 'local') {
      const storedVersion = localStorage.getItem('delivery_receipts_version');
      
      // Update data if version is different or doesn't exist
      if (!storedVersion || storedVersion !== DELIVERY_RECEIPT_DATA_VERSION) {
        localStorage.setItem('delivery_receipts', JSON.stringify(DELIVERY_RECEIPTS));
        localStorage.setItem('delivery_receipts_version', DELIVERY_RECEIPT_DATA_VERSION);
      }
    }
  }

  async getAll(): Promise<DeliveryReceipt[]> {
    if (environment.use === 'local') {
      return JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
    }
    try {
      const response = await this.http.get<DeliveryReceipt[]>(this.apiUrl).toPromise();
      return response || [];
    } catch (error) {
      console.error('Error fetching delivery receipts:', error);
      throw error;
    }
  }

  async editReceipt(receipt: DeliveryReceipt): Promise<DeliveryReceipt> {
    if (!receipt.id) {
      throw new Error('Receipt ID is required');
    }

    if (environment.use === 'local') {
      const receipts = JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
      const index = receipts.findIndex((r: DeliveryReceipt) => r.id === receipt.id);
      if (index !== -1) {
        receipts[index] = receipt;
        localStorage.setItem('delivery_receipts', JSON.stringify(receipts));
        return receipt;
      }
      throw new Error('Receipt not found');
    }
    const response = await this.http.put<DeliveryReceipt>(`${this.apiUrl}/${receipt.id}`, receipt).toPromise();
    if (!response) throw new Error('Failed to update receipt');
    return response;
  }

  async moveForInspection(id: string): Promise<DeliveryReceipt> {
    if (environment.use === 'local') {
      const receipts = JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
      const receipt = receipts.find((r: DeliveryReceipt) => r.id === id);
      if (receipt) {
        receipt.status = 'processing';
        await this.editReceipt(receipt);
        return receipt;
      }
      throw new Error('Receipt not found');
    }
    const response = await this.http.patch<DeliveryReceipt>(`${this.apiUrl}/${id}`, { status: 'processing' }).toPromise();
    if (!response) throw new Error('Failed to move receipt for inspection');
    return response;
  }

  async moveToVerified(id: string): Promise<DeliveryReceipt> {
    if (environment.use === 'local') {
      const receipts = JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
      const receipt = receipts.find((r: DeliveryReceipt) => r.id === id);
      if (receipt) {
        receipt.status = 'verified';
        await this.editReceipt(receipt);
        return receipt;
      }
      throw new Error('Receipt not found');
    }
    const response = await this.http.patch<DeliveryReceipt>(`${this.apiUrl}/${id}`, { status: 'verified' }).toPromise();
    if (!response) throw new Error('Failed to verify receipt');
    return response;
  }

  async moveToRejected(id: string): Promise<DeliveryReceipt> {
    if (environment.use === 'local') {
      const receipts = JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
      const receipt = receipts.find((r: DeliveryReceipt) => r.id === id);
      if (receipt) {
        receipt.status = 'unverified';
        await this.editReceipt(receipt);
        return receipt;
      }
      throw new Error('Receipt not found');
    }
    const response = await this.http.patch<DeliveryReceipt>(`${this.apiUrl}/${id}`, { status: 'unverified' }).toPromise();
    if (!response) throw new Error('Failed to reject receipt');
    return response;
  }

  async markAsStocked(id: string): Promise<DeliveryReceipt> {
    if (environment.use === 'local') {
      const receipts = JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
      const receipt = receipts.find((r: DeliveryReceipt) => r.id === id);
      if (receipt) {
        receipt.stocked = true;
        await this.editReceipt(receipt);
        return receipt;
      }
      throw new Error('Receipt not found');
    }
    const response = await this.http.patch<DeliveryReceipt>(`${this.apiUrl}/${id}`, { stocked: true }).toPromise();
    if (!response) throw new Error('Failed to mark receipt as stocked');
    return response;
  }

  async deleteReceipt(id: string): Promise<DeliveryReceipt> {
    if (environment.use === 'local') {
      const receipts = JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
      const index = receipts.findIndex((r: DeliveryReceipt) => r.id === id);
      if (index === -1) throw new Error('Receipt not found');
      
      const deletedReceipt = receipts.splice(index, 1)[0];
      localStorage.setItem('delivery_receipts', JSON.stringify(receipts));
      return deletedReceipt;
    }
    const response = await this.http.delete<DeliveryReceipt>(`${this.apiUrl}/${id}`).toPromise();
    if (!response) throw new Error('Failed to delete receipt');
    return response;
  }

  async getAllDRItems(): Promise<DeliveryReceiptItems[]> {
    console.log("getAllDRItems called");
    const [allStocks, allReceipts] = await Promise.all([
      this.stockService.getAll(),
      this.getAll()
    ]);
    console.log(`Fetched ${allReceipts.length} receipts and ${allStocks.length} stock records.`);

    const result: DeliveryReceiptItems[] = [];

    for (const dr of allReceipts) {
      // 1. Start with stocks directly linked via dr_id
      let itemsForDR: Stock[] = allStocks.filter(stock => stock.dr_id === dr.receipt_number);
      const itemIdsFromStockService = new Set(itemsForDR.map(item => item.id)); // Keep track of IDs already present
      console.log(`Receipt ${dr.receipt_number}: Found ${itemsForDR.length} existing stock items.`);

      // 2. If DR is verified, check linked Requisition for delivered products
      if (dr.status === 'verified') {
        console.log(`Receipt ${dr.receipt_number} is verified. Checking requisition...`);
        if (dr.purchase_order) {
          try {
            const purchaseOrder = await this.purchaseOrderService.getPurchaseOrderById(dr.purchase_order);
            if (purchaseOrder && purchaseOrder.requisitionId) {
              const requisition = await this.requisitionService.getRequisitionById(purchaseOrder.requisitionId);
              if (requisition && requisition.products) {
                console.log(`Found requisition ${requisition.id} with ${requisition.products.length} products.`);
                const deliveredProducts = requisition.products.filter(p => p.status === 'delivered');
                console.log(`Found ${deliveredProducts.length} delivered products in requisition.`);

                for (const product of deliveredProducts) {
                  // Check if this product (by ID) is already in itemsForDR from StockService
                  // We assume product.id corresponds to a potential stock.id or is unique enough
                  if (!itemIdsFromStockService.has(product.id)) {
                      console.log(`Product ${product.name} (ID: ${product.id}) not found in existing stocks for DR ${dr.receipt_number}. Converting from requisition.`);
                      // Convert Requisition product to Stock format
                      const stockFromProduct: Stock = {
                        id: product.id, // Use product ID as stock ID
                        dr_id: dr.receipt_number,
                        storage_id: undefined, // Needs assignment in stocking component
                        storage_name: undefined,
                        product_id: product.id, // Or map to a category ID if available
                        product_name: product.name, // Or map to a category name
                        name: product.name,
                        ticker: `PROP-${product.id.substring(0, 6)}`, // Generate a basic ticker/property number
                        price: product.price,
                        quantity: product.quantity,
                        dateAdded: new Date(), // Use current date or requisition date?
                        description: product.specifications || 'Item from requisition',
                        status: 'delivered' // Reflects status from requisition
                      };
                      itemsForDR.push(stockFromProduct);
                  } else {
                     console.log(`Product ${product.name} (ID: ${product.id}) already exists in stock items for DR ${dr.receipt_number}.`);
                  }
                }
              } else {
                 console.warn(`Requisition ${purchaseOrder.requisitionId} not found or has no products for DR ${dr.receipt_number}.`);
              }
            } else {
                 console.warn(`Purchase Order ${dr.purchase_order} not found or missing requisitionId for DR ${dr.receipt_number}.`);
            }
          } catch (error) {
            console.error(`Error processing requisition link for DR ${dr.receipt_number}:`, error);
          }
        } else {
           console.warn(`Verified DR ${dr.receipt_number} has no purchase_order link.`);
        }
      }
       else {
          console.log(`Receipt ${dr.receipt_number} is not verified (${dr.status}). Skipping requisition check.`);
      }

      result.push({
        deliveryReceipt: dr,
        items: itemsForDR
      });
    }

    console.log("getAllDRItems finished. Returning results:", result);
    return result;
  }

  async addReceipt(receipt: Omit<DeliveryReceipt, 'id'>, files: File[]): Promise<DeliveryReceipt> {
    if (environment.use === 'local') {
      const receipts = JSON.parse(localStorage.getItem('delivery_receipts') || '[]');
      const newReceipt: DeliveryReceipt = {
        ...receipt,
        id: 'DR-' + Date.now(),
        receipt_files: files.map(f => f.name),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      receipts.push(newReceipt);
      localStorage.setItem('delivery_receipts', JSON.stringify(receipts));
      return newReceipt;
    }

    const formData = new FormData();
    const receiptData = {
      ...receipt,
      delivery_date: receipt.delivery_date.toISOString()
    };
    
    Object.entries(receiptData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value?.toString() ?? '');
      }
    });
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await this.http.post<DeliveryReceipt>(this.apiUrl, formData).toPromise();
    if (!response) throw new Error('Failed to create receipt');
    return response;
  }

  async getVerifiedReceipts(): Promise<DeliveryReceipt[]> {
    try {
      const receipts = await this.getAll();
      return receipts.filter(receipt => receipt.status === 'verified');
    } catch (error) {
      console.error('Error fetching verified receipts:', error);
      throw error;
    }
  }
}
