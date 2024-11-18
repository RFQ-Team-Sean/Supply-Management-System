export interface InventoryItem {
    id?: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    location: string;
    reorder_level: number;
    created_at?: Date;
  }