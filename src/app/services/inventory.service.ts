import { Injectable } from '@angular/core';
import { z } from 'zod';
import { DepartmentService } from './departments.service';

// InventoryLocation schema
export const inventoryLocationSchema = z.object({
  id: z.string().length(32).optional(),
  name: z.string().min(1, "Location name is required"),
  officeId: z.string().length(32, "Office ID must be 32 chars"),
  capacity: z.number().int().min(1, "Capacity must be >= 1"),
  notes: z.string().max(500).optional()
});

// Inventory schema
export const inventorySchema = z.object({
  id: z.string().length(32).optional(),
  itemName: z.string().min(1, "Item name is required"), // from classification
  locationId: z.string().length(32, "Location ID must be 32 chars"),
  quantity: z.number().min(0, "Quantity must be >= 0"),
  dateAcquired: z.date().optional(),
  notes: z.string().max(1000).optional()
});

export type InventoryLocation = z.infer<typeof inventoryLocationSchema>;
export type Inventory = z.infer<typeof inventorySchema>;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly INVENTORY_STORAGE_KEY = 'inventory_data';
  private readonly LOCATIONS_STORAGE_KEY = 'inventory_locations';

  private inventoryList: Inventory[] = [];
  private locations: InventoryLocation[] = [];

  constructor(
    private departmentService: DepartmentService,
  ) {
    this.loadFromLocalStorage();
    if (!this.inventoryList.length && !this.locations.length) {
      this.loadDummyData();
    }
  }

  private loadFromLocalStorage() {
    const inv = localStorage.getItem(this.INVENTORY_STORAGE_KEY);
    const loc = localStorage.getItem(this.LOCATIONS_STORAGE_KEY);

    this.inventoryList = inv ? JSON.parse(inv) : [];
    this.locations = loc ? JSON.parse(loc) : [];
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.INVENTORY_STORAGE_KEY, JSON.stringify(this.inventoryList));
    localStorage.setItem(this.LOCATIONS_STORAGE_KEY, JSON.stringify(this.locations));
  }

  private generateId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

private loadDummyData() {
  // Generate multiple locations
  const loc1: InventoryLocation = {
    id: this.generateId(),
    name: 'Main Warehouse',
    officeId: '550e8400e29b41d4a716446655440010', // Example office ID
    capacity: 1000
  };
  const loc2: InventoryLocation = {
    id: this.generateId(),
    name: 'IT Storage Room',
    officeId: '550e8400e29b41d4a716446655440013', // Example office ID
    capacity: 200
  };
  const loc3: InventoryLocation = {
    id: this.generateId(),
    name: 'Engineering Supply Depot',
    officeId: '550e8400e29b41d4a716446655440011', // Example office ID
    capacity: 300
  };
  const loc4: InventoryLocation = {
    id: this.generateId(),
    name: 'Nursing Equipment Storage',
    officeId: '550e8400e29b41d4a716446655440015', // Example office ID
    capacity: 150
  };
  const loc5: InventoryLocation = {
    id: this.generateId(),
    name: 'Business Administration Archive',
    officeId: '550e8400e29b41d4a716446655440012', // Example office ID
    capacity: 100
  };

  // Generate sample inventory items
  const inventoryItems: Inventory[] = [
    {
      id: this.generateId(),
      itemName: 'Laptops',
      locationId: loc2.id!,
      quantity: 20,
      dateAcquired: new Date('2023-01-15'),
      notes: 'Used for IT and computer science programs.'
    },
    {
      id: this.generateId(),
      itemName: 'Whiteboards',
      locationId: loc3.id!,
      quantity: 50,
      dateAcquired: new Date('2023-03-10'),
      notes: 'For engineering classrooms and offices.'
    },
    {
      id: this.generateId(),
      itemName: 'First Aid Kits',
      locationId: loc4.id!,
      quantity: 75,
      dateAcquired: new Date('2023-02-25'),
      notes: 'For nursing students and faculty.'
    },
    {
      id: this.generateId(),
      itemName: 'Projectors',
      locationId: loc1.id!,
      quantity: 10,
      dateAcquired: new Date('2022-12-30'),
      notes: 'Shared among all departments.'
    },
    {
      id: this.generateId(),
      itemName: 'Office Chairs',
      locationId: loc1.id!,
      quantity: 100,
      dateAcquired: new Date('2022-10-15'),
      notes: 'Stored for future use or replacements.'
    },
    {
      id: this.generateId(),
      itemName: 'Textbooks - Business Administration',
      locationId: loc5.id!,
      quantity: 200,
      dateAcquired: new Date('2022-09-20'),
      notes: 'Stored for reference and student use.'
    },
    {
      id: this.generateId(),
      itemName: 'CAD Workstations',
      locationId: loc3.id!,
      quantity: 15,
      dateAcquired: new Date('2023-01-05'),
      notes: 'High-performance computers for engineering design.'
    },
    {
      id: this.generateId(),
      itemName: 'Digital Thermometers',
      locationId: loc4.id!,
      quantity: 50,
      dateAcquired: new Date('2023-04-01'),
      notes: 'For practical nursing training.'
    },
    {
      id: this.generateId(),
      itemName: 'Network Switches',
      locationId: loc2.id!,
      quantity: 25,
      dateAcquired: new Date('2023-03-12'),
      notes: 'Used for IT networking projects.'
    },
    {
      id: this.generateId(),
      itemName: 'Filing Cabinets',
      locationId: loc5.id!,
      quantity: 30,
      dateAcquired: new Date('2023-01-20'),
      notes: 'For archiving department documents.'
    },
    {
      id: this.generateId(),
      itemName: 'Printers',
      locationId: loc1.id!,
      quantity: 15,
      dateAcquired: new Date('2022-11-25'),
      notes: 'Distributed across various offices.'
    },
    {
      id: this.generateId(),
      itemName: 'Desks',
      locationId: loc3.id!,
      quantity: 120,
      dateAcquired: new Date('2022-08-10'),
      notes: 'Extra desks for classrooms and offices.'
    },
    {
      id: this.generateId(),
      itemName: 'Microscopes',
      locationId: loc4.id!,
      quantity: 40,
      dateAcquired: new Date('2023-02-15'),
      notes: 'For use in nursing laboratory experiments.'
    }
  ];

  this.locations = [loc1, loc2, loc3, loc4, loc5];
  this.inventoryList = inventoryItems;
  this.saveToLocalStorage();
}


  // CRUD for Inventory Locations
  async getAllLocations(): Promise<InventoryLocation[]> {
    return this.locations;
  }

  async addLocation(data: Omit<InventoryLocation, 'id'>): Promise<InventoryLocation> {
    const newLoc: InventoryLocation = {
      ...data,
      id: this.generateId()
    };
    inventoryLocationSchema.parse(newLoc);
    this.locations.push(newLoc);
    this.saveToLocalStorage();
    return newLoc;
  }

  async updateLocation(loc: InventoryLocation): Promise<InventoryLocation> {
    inventoryLocationSchema.parse(loc);
    const idx = this.locations.findIndex(l => l.id === loc.id);
    if (idx === -1) throw new Error('Location not found');
    this.locations[idx] = loc;
    this.saveToLocalStorage();
    return loc;
  }

  async deleteLocation(id: string): Promise<void> {
    this.locations = this.locations.filter(l => l.id !== id);
    // clear references from inventory
    this.inventoryList = this.inventoryList.map(inv =>
      inv.locationId === id ? { ...inv, locationId: '' } : inv
    );
    this.saveToLocalStorage();
  }

  // CRUD for Inventory
  async getAllInventory(): Promise<Inventory[]> {
    return this.inventoryList;
  }

  async addInventory(data: Omit<Inventory, 'id'>): Promise<Inventory> {
    const newInv: Inventory = {
      ...data,
      id: this.generateId()
    };
    inventorySchema.parse(newInv);
    this.inventoryList.push(newInv);
    this.saveToLocalStorage();
    return newInv;
  }

  async updateInventory(item: Inventory): Promise<Inventory> {
    inventorySchema.parse(item);
    const idx = this.inventoryList.findIndex(i => i.id === item.id);
    if (idx === -1) throw new Error('Item not found');
    this.inventoryList[idx] = item;
    this.saveToLocalStorage();
    return item;
  }

  async deleteInventory(id: string): Promise<void> {
    this.inventoryList = this.inventoryList.filter(i => i.id !== id);
    this.saveToLocalStorage();
  }

   getOfficeOfLocation(id:string){
    return this.locations.find(i=>i.id == id)?.officeId;
  }

  async getLocationsOnDepartment(id?:string): Promise<InventoryLocation[]>{
    const offices = await this.departmentService.getAllOffices();
    const officeList = offices.reduce((acc,curr)=> {
      if(curr.departmentId==id){
        return [...acc,curr.id!];
      }else{
        return acc;
      }
    },[] as String[])
    return this.locations.filter(loc=>officeList.includes(loc.officeId))
  }

  async getUsedSpace(locationId: string): Promise<number> {
    try {
      // For demonstration, returning a random number
      // Replace this with your actual implementation
      return Math.floor(Math.random() * 100);
    } catch (error) {
      console.error('Error getting used space:', error);
      return 0;
    }
  }
}
