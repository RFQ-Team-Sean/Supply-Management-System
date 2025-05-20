import { Injectable } from '@angular/core';
import {  DeliveryReceiptItems } from './delivery-receipt.service';
import { z } from 'zod';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { NotificationService } from './notifications.service';


// Define the schema for a single disbursement voucher item
export const disbursementVoucherItemSchema = z.object({
  itemDescription: z.string().min(1),  // Item description (e.g., "Apple Inc.")
  quantity: z.number().min(1),  // Quantity of the item (e.g., 50)
  unitPrice: z.number().min(0),  // Unit price (e.g., 145.30)
  totalPrice: z.number().min(0),  // Total price (quantity * unitPrice)
});

// Define the disbursement voucher schema
export const disbursementVoucherSchema = z.object({
  voucherNo: z.string().min(1),  // Unique voucher number (e.g., "DV-2025-123456")
  date: z.date(),  // Date the voucher was created
  deliveryReceiptNo: z.string().min(1),  // Delivery receipt number (e.g., "REC0012351")
  supplierName: z.string().min(1),  // Name of the supplier (e.g., "Emily White")
  paymentMethod: z.string().min(1),  // Payment method (e.g., "Bank Transfer")
  totalAmountDue: z.number().min(0),  // Total amount due (e.g., 20652.50)
  notes: z.string().optional(),  // Optional notes (e.g., "Verified and completed.")
  status: z.enum(['pending', 'processing', 'recorded']),  // Status of the voucher
});

export type DisbursementVoucher = z.infer<typeof disbursementVoucherSchema> & {
  itemizedDetails: z.infer<typeof disbursementVoucherItemSchema>[];
};

export interface ExtendedDisbursementVoucher extends DisbursementVoucher {
  debitEntries: { accountCode: string; accountName: string; amount: number }[];
  creditEntries: { accountCode: string; accountName: string; amount: number }[];
}


@Injectable({
  providedIn: 'root'
})
export class DisbursementVoucherService {

  disbursementVouchers:DisbursementVoucher[] = [ ];

  constructor(
    private userService:UserService, private notifService:NotificationService
  ) { }

  /**
   * Generate a disbursement voucher based on the delivery receipt and items.
   * @param receipt The delivery receipt object
   * @param items List of items associated with the receipt
   * @returns The disbursement voucher
   */
  async generateDisbursementVouchers(receiptsWithItems: DeliveryReceiptItems[]): Promise<DisbursementVoucher[]> {
    const local_disbursementVoucher = localStorage.getItem('disbursementVouchers');
    if (local_disbursementVoucher) {
      this.disbursementVouchers = JSON.parse(local_disbursementVoucher) as DisbursementVoucher[];
    }
  
    for (let receipt of receiptsWithItems) {
      if (!receipt.deliveryReceipt.stocked) continue;
  
      const itemsForReceipt = receipt.items;
  
      // Calculate itemized details and total amount
      const itemizedDetails = itemsForReceipt.map(item => ({
        itemDescription: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
      }));
  
      const totalAmountDue = itemizedDetails.reduce((total, item) => total + item.totalPrice, 0);
  
      const voucherNo = `DV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
      const exists = this.disbursementVouchers.find(voucher => voucher.deliveryReceiptNo == receipt.deliveryReceipt.receipt_number);
  
      if (!exists) {
        this.disbursementVouchers.push({
          voucherNo: voucherNo,
          date: new Date(),
          deliveryReceiptNo: receipt.deliveryReceipt.receipt_number,
          supplierName: receipt.deliveryReceipt.supplier_name,
          paymentMethod: 'Bank Transfer',
          totalAmountDue: totalAmountDue,
          itemizedDetails: itemizedDetails,
          notes: receipt.deliveryReceipt.notes,
          status: 'pending',
        });
      }
    }
  
    localStorage.setItem('disbursementVouchers', JSON.stringify(this.disbursementVouchers));
    return this.disbursementVouchers;
  }
  

 async sendToAccounting(voucherNo:string){
    const dvIndex = this.disbursementVouchers.findIndex(v => v.voucherNo == voucherNo);
    this.disbursementVouchers[dvIndex].status = 'processing';
    localStorage.setItem('disbursementVouchers', JSON.stringify(this.disbursementVouchers));
    const users = await firstValueFrom(this.userService.getAllUsers());
    for(let user of users){
      if(user.role == 'superadmin' || user.role == 'accounting' || user.role == 'supply'){
        this.notifService.addNotification(
        `Voucher No. ${this.disbursementVouchers[dvIndex].voucherNo} has been moved to accounting for review.`,
        'info',
        user.id
        )
      }
    }
  }

  // disbursement-voucher.service.ts
async verifyVoucher(voucherNo: string) {
  const dvIndex = this.disbursementVouchers.findIndex(v => v.voucherNo == voucherNo);
  this.disbursementVouchers[dvIndex].status = 'recorded';
  localStorage.setItem('disbursementVouchers', JSON.stringify(this.disbursementVouchers));
  const users = await firstValueFrom(this.userService.getAllUsers());
  for (let user of users) {
    if (user.role == 'superadmin' || user.role == 'accounting' || user.role == 'supply') {
      this.notifService.addNotification(
        `Voucher No. ${this.disbursementVouchers[dvIndex].voucherNo} has been verified by accounting.`,
        'info',
        user.id
      )
    }
  }
}

  async rejectVoucher(voucherNo:string){
    const dvIndex = this.disbursementVouchers.findIndex(v => v.voucherNo == voucherNo);
    this.disbursementVouchers[dvIndex].status = 'pending';
    localStorage.setItem('disbursementVouchers', JSON.stringify(this.disbursementVouchers));
    const users = await firstValueFrom(this.userService.getAllUsers());
    for(let user of users){
      if(user.role == 'superadmin' || user.role == 'accounting' || user.role == 'supply'){
        this.notifService.addNotification(
        `Voucher No. ${this.disbursementVouchers[dvIndex].voucherNo} has been rejected by accounting.`,
        'info',
        user.id
        )
      }
    }
  }

  async getAll(): Promise<DisbursementVoucher[]> {
    const local_disbursementVoucher = localStorage.getItem('disbursementVouchers');
    if (local_disbursementVoucher) {
      this.disbursementVouchers = JSON.parse(local_disbursementVoucher) as DisbursementVoucher[];
    }
    return this.disbursementVouchers;
  }

  /**
   * Add a new disbursement voucher to the service and save it to localStorage.
   * @param newVoucher The disbursement voucher to be added.
   */
  addVoucher(newVoucher: DisbursementVoucher): void {
    this.disbursementVouchers.push(newVoucher);
    localStorage.setItem('disbursementVouchers', JSON.stringify(this.disbursementVouchers));
  }
  
}
