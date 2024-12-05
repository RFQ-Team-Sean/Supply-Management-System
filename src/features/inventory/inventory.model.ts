// inventory.model.ts
export interface InventoryItem {
    item_id?: number;
    item_number: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    location: string;
    category: string;
    reorder_level: number;
    created_at?: Date;
}

export interface ItemRequest {
    request_id?: number;
    department: string;
    item_name: string;
    quantity: number;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: Date;
}

export type InventoryStatus = 'Available' | 'Out of Stock' | 'Low Stock';