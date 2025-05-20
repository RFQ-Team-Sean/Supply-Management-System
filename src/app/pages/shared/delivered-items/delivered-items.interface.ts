// models/delivered-items.interface.ts
export interface DeliveryItem {
    id: string;
    name: string;
    quantity: number;
    status: 'pending' | 'delivered' | 'missing';
    isDelivered: boolean;
    remarks?: string;
  dateChecked?: Date;
  }
  
  export interface DeliveredItem {
    id: string;
    supplierName: string;
    supplierId: string;
    dateDelivered: Date;
    department: string;
    documentUrl: string;
    status: 'pending' | 'accepted' | 'rejected';
    items: DeliveryItem[];
    totalAmount?: number;
    poNumber?: string;
    remarks?: string;
    lastUpdated?: Date;
  }