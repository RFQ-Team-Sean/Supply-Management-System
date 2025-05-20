import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Warehouse } from '../schema/schema';
import { warehouseData } from '../schema/inventory-dummydata';

export interface WarehouseAdjustment {
  type: 'Stock Addition' | 'Transfer' | 'Removal' | 'Update';
  item: string;
  quantity: number;
  date: Date;
  receipt?: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private readonly dummyWarehouses: Warehouse[] = warehouseData;

  constructor(private crudService: CrudService) {
    // Initialize the warehouse data in local storage
    if (localStorage.getItem('warehouses') === null) {
      localStorage.setItem('warehouses', JSON.stringify(this.dummyWarehouses));
    }
  }

  async getAll(): Promise<Warehouse[]> {
    const warehouses = localStorage.getItem('warehouses');
    return warehouses ? JSON.parse(warehouses) : this.dummyWarehouses;
  }

  async get(id: string): Promise<Warehouse | undefined> {
    const warehouses = await this.getAll();
    return warehouses.find(w => w.id === id);
  }

  async create(warehouse: Omit<Warehouse, 'id'>): Promise<Warehouse> {
    const warehouses = await this.getAll();
    const newWarehouse = {
      ...warehouse,
      id: Math.random().toString(36).substring(7)
    };
    warehouses.push(newWarehouse);
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    return newWarehouse;
  }

  async update(id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const warehouses = await this.getAll();
    const index = warehouses.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Warehouse not found');
    
    warehouses[index] = { ...warehouses[index], ...warehouse };
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    return warehouses[index];
  }

  async delete(id: string): Promise<void> {
    const warehouses = await this.getAll();
    const filtered = warehouses.filter(w => w.id !== id);
    localStorage.setItem('warehouses', JSON.stringify(filtered));
  }

  async getProductAdjustments(warehouseId: string, productName: string): Promise<WarehouseAdjustment[]> {
    const adjustments = await this.getWarehouseAdjustments(warehouseId);
    return adjustments.filter(adj => adj.item === productName);
  }

  async getWarehouseAdjustments(warehouseId: string): Promise<WarehouseAdjustment[]> {
    try {
      const adjustments = JSON.parse(localStorage.getItem('warehouseAdjustments') || '{}');
      return adjustments[warehouseId] || [];
    } catch (error) {
      console.error('Error getting warehouse adjustments:', error);
      return [];
    }
  }

  async addWarehouseAdjustment(warehouseId: string, adjustment: WarehouseAdjustment): Promise<void> {
    try {
      const adjustments = JSON.parse(localStorage.getItem('warehouseAdjustments') || '{}');
      if (!adjustments[warehouseId]) {
        adjustments[warehouseId] = [];
      }
      adjustments[warehouseId].push({
        ...adjustment,
        date: new Date()
      });
      localStorage.setItem('warehouseAdjustments', JSON.stringify(adjustments));
    } catch (error) {
      console.error('Error adding warehouse adjustment:', error);
      throw error;
    }
  }
} 