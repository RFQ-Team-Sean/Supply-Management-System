import { Injectable } from '@angular/core';
import { z } from 'zod';

import { UserService } from './user.service';
import { NotificationService } from './notifications.service';
import { SuppliersService } from './suppliers.service';
import { firstValueFrom } from 'rxjs';
export const rfqSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  status: z.enum(['new','canvasing','approved']),
  purchase_order: z.string().optional(),
  suppliers: z.array(z.object({
    supplierId: z.string().length(32),
    supplierName: z.string(),  // The supplier ID
    biddingPrice: z.number().min(0, "Bidding price must be a positive number").optional()  // The bidding price
  })),
  supplier: z.string().optional(),
  awarding: z.enum(['pending','awarded']).optional(),
});

export type RFQ = z.infer<typeof rfqSchema>;

@Injectable({
  providedIn: 'root'
})
export class RFQService {
  private rfqData: RFQ[] = [
    {
      id: 'RFQ-20100-0002',
      purchase_order: '813125',
      suppliers: [
        { 
          supplierName:'Tech Supplies Co.',
          supplierId: '12345678901234567890123456789012', biddingPrice: 1100.00 }
      ],
      status: 'new',
    },
    {
      id: 'RFQ-20100-0004',
      purchase_order: '813125',
      suppliers: [
        { 
          supplierName:'Tech Supplies Co.',
          supplierId: '12345678901234567890123456789012', biddingPrice: 900.00 }
      ],

      status: 'canvasing',
    },
    {
      id: 'RFQ-20100-0012',
      purchase_order: '813125',
      suppliers: [
        { 
          supplierName:'Tech Supplies Co.',
          supplierId: '12345678901234567890123456789012', biddingPrice: 1250.75 }
      ],

      status: 'canvasing',
    },
    {
      id: 'RFQ-20100-0011',
      purchase_order: '813125',
      suppliers: [
        { 
          supplierName:'Tech Supplies Co.',
          supplierId: '12345678901234567890123456789012', biddingPrice: 980.40 }
      ],

      status: 'new',
    },
    {
      id: 'RFQ-20100-0114',
      purchase_order: '813125',
      suppliers: [
        { 
          supplierName:'Tech Supplies Co.',
          supplierId: '12345678901234567890123456789012', biddingPrice: 340.50 }
      ],

      status: 'new',
    },
    {
      id: 'RFQ-20100-0100',
      purchase_order: '813125',
      suppliers: [
        { 
          supplierName:'Tech Supplies Co.',
          supplierId: '12345678901234567890123456789012', biddingPrice: 1500.00 }
      ],

      status: 'canvasing',
    },
    {
      id: 'RFQ-20100-1111',
      purchase_order: '813125',
      suppliers: [
        { 
          supplierName:'Tech Supplies Co.',
          supplierId: '12345678901234567890123456789012', biddingPrice: 920.00 }
      ],

      status: 'canvasing',
    }
  ];

  constructor(
    private notifService: NotificationService,
    private supplierService: SuppliersService, 
    private userService: UserService
  ) { }

  async getAll(): Promise<RFQ[]> {
    const local_rfqs = localStorage.getItem('rfqs');
    if (local_rfqs) {
      this.rfqData = JSON.parse(local_rfqs) as RFQ[];
    }
    return this.rfqData;
  }

  async addRFQ(rfq: RFQ) {
    this.rfqData.push({
      ...rfq
    });
    localStorage.setItem('rfqs', JSON.stringify(this.rfqData));
  }

  async editRFQ(rfq: RFQ) {
    const rfqIndex = this.rfqData.findIndex(item => item.id == rfq.id);
    if (rfqIndex !== -1) {
      this.rfqData[rfqIndex] = rfq;
      localStorage.setItem('rfqs', JSON.stringify(this.rfqData));
    }
  }

  async deleteRFQ(id: string) {
    this.rfqData = this.rfqData.filter(item => item.id !== id);
    localStorage.setItem('rfqs', JSON.stringify(this.rfqData));
  }

  async getById(id: string): Promise<RFQ | undefined> {
  const rfqs = await this.getAll(); // Reuse the existing getAll logic
  return rfqs.find((rfq) => rfq.id === id);
}

}

