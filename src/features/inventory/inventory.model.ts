export interface InventoryItem {
    item_id?: number; // Changed id to item_id
    item_name: string;
    quantity: number;
    unit_price: number;
    location: string;
    reorder_level: number;
    created_at?: Date;
  }
  