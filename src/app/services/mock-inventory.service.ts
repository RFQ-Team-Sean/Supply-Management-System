import { Injectable } from '@angular/core';
import { InventoryLocation } from './inventory.service';

@Injectable({
  providedIn: 'root'
})
export class MockInventoryService {
  private inventoryLocations: InventoryLocation[] = [
    // Paste the dummy data here
  ];

  constructor() { }

  async getAllLocations(): Promise<InventoryLocation[]> {
    return Promise.resolve(this.inventoryLocations);
  }

  async getLocationsOnDepartment(departmentId: string): Promise<InventoryLocation[]> {
    return Promise.resolve(
      this.inventoryLocations.filter(loc => 
        loc.department_id === departmentId && loc.active === true)
    );
  }
} 