import { Injectable } from '@angular/core';

import { z } from 'zod';
import { Stock } from './stocks.service';
import { StocksService } from './stocks.service';

export const purchaseOrderSchema = z.object({
  id: z.string().min(1, 'Purchase Order ID cannot be empty'),
  requisitionId: z.string().min(1, 'Requisition ID is required'),
  supplierName: z.string().min(1, 'Supplier Name is required'),
  totalAmount: z.number().min(0, 'Total Amount must be positive'),
  dateCreated: z.date(),
  status: z.enum(['Pending', 'Completed', 'Cancelled']),
  stocked: z.boolean(),
  receipts: z.array(z.string()),
});
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;

export type PurchaseOrderItems = {
  purchaseOrder: PurchaseOrder,
  items: Stock[],
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private newPurchaseOrder: PurchaseOrder = {
    id: 'PO-2024-001',
    requisitionId: 'REQ-2024-001',
    supplierName: 'Tech Solutions Inc.',
    totalAmount: 50000,
    dateCreated: new Date('2024-02-20'),
    status: 'Pending',
    stocked: false,
    receipts: [],
  };

  private newPurchaseOrderItemsEntry: PurchaseOrderItems = {
    purchaseOrder: this.newPurchaseOrder,
    items: [
      {
        id: 'item1_po-2024-001',
        name: 'Laptop Power Adapter',
        ticker: 'ADP-2024-001',
        price: 2500.00,
        quantity: 10,
        description: 'Standard 65W USB-C Power Adapter',
        dateAdded: new Date('2024-02-20'),
        dr_id: undefined,
        storage_id: 'WH001',
        storage_name: 'Main Warehouse',
        product_id: 'ELEC002',
        product_name: 'Accessories'
      },
      {
        id: 'item2_po-2024-001',
        name: 'Wireless Keyboard',
        ticker: 'KBD-2024-001',
        price: 2500.00,
        quantity: 10,
        description: 'Full-size wireless keyboard with numpad',
        dateAdded: new Date('2024-02-20'),
        dr_id: undefined,
        storage_id: 'WH001',
        storage_name: 'Main Warehouse',
        product_id: 'ELEC002',
        product_name: 'Accessories'
      }
    ]
  };

  // --- Add Dummy PO-2024-002 ---
  private newPurchaseOrder2: PurchaseOrder = {
    id: 'PO-2024-002',
    requisitionId: 'REQ-2024-002',
    supplierName: 'Office Supplies Co.',
    totalAmount: 1500.00,
    dateCreated: new Date('2024-03-01'),
    status: 'Pending',
    stocked: false,
    receipts: [],
  };

  private newPurchaseOrderItemsEntry2: PurchaseOrderItems = {
    purchaseOrder: this.newPurchaseOrder2,
    items: [
      {
        id: 'item1_po-2024-002',
        name: 'Stapler',
        ticker: 'STP-2024-001',
        price: 500.00,
        quantity: 5,
        description: 'Heavy-duty office stapler',
        dateAdded: new Date('2024-03-01'),
        dr_id: undefined,
        storage_id: 'WH001',
        storage_name: 'Main Warehouse',
        product_id: 'OFFSUP002',
        product_name: 'Office Supplies'
      },
      {
        id: 'item2_po-2024-002',
        name: 'Printer Paper (Ream)',
        ticker: 'PAP-2024-001',
        price: 200.00,
        quantity: 5,
        description: 'Standard A4 printer paper, 500 sheets',
        dateAdded: new Date('2024-03-01'),
        dr_id: undefined,
        storage_id: 'WH001',
        storage_name: 'Main Warehouse',
        product_id: 'OFFSUP002',
        product_name: 'Office Supplies'
      }
    ]
  };
  // --- End Dummy PO-2024-002 ---

  // --- Add Dummy PO-2024-003 ---
  private newPurchaseOrder3: PurchaseOrder = {
    id: 'PO-2024-003',
    requisitionId: 'REQ-2024-003',
    supplierName: 'Furniture Plus', // Match supplier from DR if possible
    totalAmount: 12000.00,
    dateCreated: new Date('2024-03-05'),
    status: 'Completed', // Assume completed since report is being generated
    stocked: true, // Assume stocked
    receipts: ['some-receipt-url-for-po3.png'], // Example receipt
  };

  private newPurchaseOrderItemsEntry3: PurchaseOrderItems = {
    purchaseOrder: this.newPurchaseOrder3,
    items: [
      {
        id: 'item1_po-2024-003',
        name: 'Executive Desk',
        ticker: 'DSK-EXC-001',
        price: 8000.00,
        quantity: 1,
        description: 'Large executive desk with drawers',
        dateAdded: new Date('2024-03-05'),
        dr_id: 'DR-2024-003', // Link to the DR
        storage_id: 'WH002',
        storage_name: 'Secondary Warehouse',
        product_id: 'FURN001',
        product_name: 'Furniture'
      },
      {
        id: 'item2_po-2024-003',
        name: 'Leather Office Chair',
        ticker: 'CHR-LTH-001',
        price: 4000.00,
        quantity: 1,
        description: 'High-back leather executive chair',
        dateAdded: new Date('2024-03-05'),
        dr_id: 'DR-2024-003', // Link to the DR
        storage_id: 'WH002',
        storage_name: 'Secondary Warehouse',
        product_id: 'FURN001',
        product_name: 'Furniture'
      }
    ]
  };
  // --- End Dummy PO-2024-003 ---

  private purchaseOrders: PurchaseOrder[] = [
    this.newPurchaseOrder,
    this.newPurchaseOrder2,
    this.newPurchaseOrder3,
    {
      id: 'PO12345678',
      requisitionId: 'REQ-OLD-001',
      supplierName: 'John Doe',
      totalAmount: 10500.50,
      dateCreated: new Date('2023-06-15'),
      status: 'Completed',
      stocked: true,
      receipts: ['assets/images/products/sample-receipt.png'],
    },
    {
      id: 'PO98765432',
      requisitionId: 'REQ-OLD-002',
      supplierName: 'Jane Smith',
      totalAmount: 4500.75,
      dateCreated: new Date('2022-11-30'),
      status: 'Pending',
      stocked: true,
      receipts: ['assets/images/products/sample-receipt.png'],
    },
    {
      id: 'PO54321abc',
      requisitionId: 'REQ-OLD-003',
      supplierName: 'Mark Brown',
      totalAmount: 2300.30,
      dateCreated: new Date('2023-01-10'),
      status: 'Cancelled',
      stocked: true,
      receipts: ['assets/images/products/sample-receipt.png'],
    },
    {
      id: 'PO54300000',
      requisitionId: 'REQ-OLD-004',
      supplierName: 'Joshua Corda',
      totalAmount: 2300.30,
      dateCreated: new Date('2023-01-10'),
      status: 'Pending',
      stocked: false,
      receipts: [],
    },
    {
      id: 'PO54300120',
      requisitionId: 'REQ-OLD-005',
      supplierName: 'Anton Caesar Cabais',
      totalAmount: 2300.30,
      dateCreated: new Date('2023-01-10'),
      status: 'Pending',
      stocked: false,
      receipts: ['assets/images/products/sample-receipt.png', 'assets/images/products/sample-receipt.png'],
    },
  ];

  private purchaseOrderItems: PurchaseOrderItems[] = [
    this.newPurchaseOrderItemsEntry,
    this.newPurchaseOrderItemsEntry2,
    this.newPurchaseOrderItemsEntry3,
    {
      purchaseOrder: this.purchaseOrders[1],
      items: [
        {
          id: 'item1_po12345678',
          name: 'Office Chair',
          ticker: 'OFC-2023-001',
          price: 4500.00,
          quantity: 2,
          description: 'Ergonomic office chair with lumbar support',
          dateAdded: new Date('2023-06-10'),
          dr_id: 'RCP-2024-001',
          storage_id: 'WH001',
          storage_name: 'Main Warehouse',
          product_id: 'FURN001',
          product_name: 'Furniture'
        },
        {
          id: 'item2_po12345678',
          name: 'Computer Monitor',
          ticker: 'MON-2023-001',
          price: 750.25,
          quantity: 2,
          description: '24-inch LCD Monitor with HDMI and DisplayPort',
          dateAdded: new Date('2023-06-10'),
          dr_id: 'RCP-2024-001',
          storage_id: 'WH001',
          storage_name: 'Main Warehouse',
          product_id: 'ELEC001',
          product_name: 'Electronics'
        }
      ]
    },
    {
      purchaseOrder: this.purchaseOrders[2],
      items: [
        {
          id: 'item1_po98765432',
          name: 'File Cabinet',
          ticker: 'CAB-2022-001',
          price: 2800.50,
          quantity: 1,
          description: 'Four-drawer locking file cabinet',
          dateAdded: new Date('2022-11-25'),
          dr_id: 'RCP-2024-002',
          storage_id: 'WH001',
          storage_name: 'Main Warehouse',
          product_id: 'FURN001',
          product_name: 'Furniture'
        },
        {
          id: 'item2_po98765432',
          name: 'Paper Shredder',
          ticker: 'SHR-2022-001',
          price: 1700.25,
          quantity: 1,
          description: 'Cross-cut paper shredder with 10-sheet capacity',
          dateAdded: new Date('2022-11-25'),
          dr_id: 'RCP-2024-002',
          storage_id: 'WH001',
          storage_name: 'Main Warehouse',
          product_id: 'ELEC001',
          product_name: 'Electronics'
        }
      ]
    },
    {
      purchaseOrder: this.purchaseOrders[3],
      items: [
        {
          id: 'item1_po54321abc',
          name: 'Printer',
          ticker: 'PRT-2023-001',
          price: 2300.30,
          quantity: 1,
          description: 'Color laser printer with network capabilities',
          dateAdded: new Date('2023-01-05'),
          dr_id: 'RCP-2024-003',
          storage_id: 'WH001',
          storage_name: 'Main Warehouse',
          product_id: 'ELEC001',
          product_name: 'Electronics'
        }
      ]
    },
    {
      purchaseOrder: this.purchaseOrders[4],
      items: [
        {
          id: 'item1_po54300000',
          name: 'Whiteboard',
          ticker: 'WB-2023-001',
          price: 1200.15,
          quantity: 1,
          description: '48" x 36" magnetic whiteboard with marker tray',
          dateAdded: new Date('2023-01-05'),
          dr_id: 'RCP-2024-004',
          storage_id: 'WH002',
          storage_name: 'Secondary Warehouse',
          product_id: 'OFFSUP001',
          product_name: 'Office Supplies'
        },
        {
          id: 'item2_po54300000',
          name: 'Conference Table',
          ticker: 'TBL-2023-001',
          price: 1100.15,
          quantity: 1,
          description: '8-person oval conference table',
          dateAdded: new Date('2023-01-05'),
          dr_id: 'RCP-2024-004',
          storage_id: 'WH002',
          storage_name: 'Secondary Warehouse',
          product_id: 'FURN001',
          product_name: 'Furniture'
        }
      ]
    },
    {
      purchaseOrder: this.purchaseOrders[5],
      items: [
        {
          id: 'item1_po54300120',
          name: 'Desktop Computer',
          ticker: 'PC-2023-001',
          price: 1500.15,
          quantity: 1,
          description: 'Business desktop computer with i5 processor',
          dateAdded: new Date('2023-01-05'),
          dr_id: 'RCP-2024-005',
          storage_id: 'WH001',
          storage_name: 'Main Warehouse',
          product_id: 'ELEC001',
          product_name: 'Electronics'
        },
        {
          id: 'item2_po54300120',
          name: 'Office Desk',
          ticker: 'DSK-2023-001',
          price: 800.15,
          quantity: 1,
          description: 'L-shaped corner desk with drawer',
          dateAdded: new Date('2023-01-05'),
          dr_id: 'RCP-2024-005',
          storage_id: 'WH001',
          storage_name: 'Main Warehouse',
          product_id: 'FURN001',
          product_name: 'Furniture'
        }
      ]
    }
  ];

  constructor(private stocksService: StocksService) { }

  async getAll(): Promise<PurchaseOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...this.purchaseOrders];
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.purchaseOrders.find(po => po.id === id);
  }

  async getPurchaseOrderWithItems(id: string): Promise<PurchaseOrderItems | undefined> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.purchaseOrderItems.find(poi => poi.purchaseOrder.id === id);
  }

  async getAllPurchaseOrdersWithItems(): Promise<PurchaseOrderItems[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...this.purchaseOrderItems];
  }

  async generatePurchaseOrder(purchaseOrder: PurchaseOrder) {
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      const validatedPO = purchaseOrderSchema.parse(purchaseOrder);
      if (!this.purchaseOrders.some(p => p.id == validatedPO.id)) {
        this.purchaseOrders.push(validatedPO);
        console.log('Purchase Order added:', validatedPO);
      } else {
        console.warn(`Purchase Order with ID ${validatedPO.id} already exists.`);
      }
    } catch (error) {
      console.error("Failed to add purchase order due to validation errors:", error);
    }
  }
}
