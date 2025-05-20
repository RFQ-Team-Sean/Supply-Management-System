//src/app/services/departments.service.ts

import { Injectable } from '@angular/core';
import { z } from 'zod';

// Define schemas
export const officeSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  name: z.string().min(1, "Office name is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  floor: z.number().int().min(0, "Floor must be non-negative"),
  extension: z.string().optional(),
  buildingId: z.string().length(32, "Building ID must be exactly 32 characters"),
  departmentId: z.string().length(32, "Department ID must be exactly 32 characters"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional()
});

export const buildingSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  name: z.string().min(1, "Building name is required"),
  address: z.string().min(1, "Address is required"),
  numberOfFloors: z.number().int().min(1, "Must have at least one floor"),
  dateConstructed: z.date().optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const departmentSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  name: z.string().min(1, "Department name is required"),
  code: z.string().min(2, "Department code must be at least 2 characters"),
  head: z.string().min(1, "Department head is required"),
  budget: z.number().min(0, "Budget must be non-negative"),
  dateEstablished: z.date(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Contact number must be at least 10 digits"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional()
});

export type Office = z.infer<typeof officeSchema>;
export type Building = z.infer<typeof buildingSchema>;
export type Department = z.infer<typeof departmentSchema>;

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly DEPARTMENTS_KEY = 'departments';
  private readonly BUILDINGS_KEY = 'buildings';
  private readonly OFFICES_KEY = 'offices';

  private departments: Department[] = [];
  private buildings: Building[] = [];
  private offices: Office[] = [];
  

  constructor() {
    this.loadFromLocalStorage();
    if (!this.departments.length) this.loadDummyData();
  }

  private loadFromLocalStorage(): void {
    const storedDepartments = localStorage.getItem(this.DEPARTMENTS_KEY);
    const storedBuildings = localStorage.getItem(this.BUILDINGS_KEY);
    const storedOffices = localStorage.getItem(this.OFFICES_KEY);

    this.departments = storedDepartments ? JSON.parse(storedDepartments) : [];
    this.buildings = storedBuildings ? JSON.parse(storedBuildings) : [];
    this.offices = storedOffices ? JSON.parse(storedOffices) : [];
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.DEPARTMENTS_KEY, JSON.stringify(this.departments));
    localStorage.setItem(this.BUILDINGS_KEY, JSON.stringify(this.buildings));
    localStorage.setItem(this.OFFICES_KEY, JSON.stringify(this.offices));
  }

  private generate32DigitId(): string {
    return Array(32)
      .fill(null)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }

  public getOffices(): Office[] {
    return this.offices;
  }

private loadDummyData(): void {
  // Dummy Departments
  const dummyDepartments: Department[] = [
    {
      id: '550e8400e29b41d4a716446655440000',
      name: 'Procurement Department',
      code: 'PROC',
      head: 'Atty. Maria Santos',
      budget: 5000000,
      dateEstablished: new Date('1995-08-20'),
      contactEmail: 'procurement@agency.gov.ph',
      contactPhone: '(02) 8123-4567',
      description: 'Handles procurement planning, bidding, and contract management.'
    },
    {
      id: '550e8400e29b41d4a716446655440001', 
      name: 'Supply and Property Management',
      code: 'SPM',
      head: 'Mr. Juan Dela Cruz',
      budget: 3000000,
      dateEstablished: new Date('1990-05-15'),
      contactEmail: 'spm@agency.gov.ph',
      contactPhone: '(02) 8234-5678',
      description: 'Manages inventory, warehousing, and property disposal.'
    },
    {
      id: '550e8400e29b41d4a716446655440002',
      name: 'Budget Department',
      code: 'BUD',
      head: 'Ms. Ana Reyes',
      budget: 4000000,
      dateEstablished: new Date('1985-10-10'),
      contactEmail: 'budget@agency.gov.ph',
      contactPhone: '(02) 8345-6789',
      description: 'Oversees budget allocation and financial planning.'
    },
    {
      id: '550e8400e29b41d4a716446655440003',
      name: 'Information Technology Department',
      code: 'ITD',
      head: 'Mr. Michael Tan',
      budget: 3500000,
      dateEstablished: new Date('2000-03-12'),
      contactEmail: 'it@agency.gov.ph',
      contactPhone: '(02) 8456-7890',
      description: 'Maintains IT infrastructure and inventory systems.'
    },
    {
      id: '550e8400e29b41d4a716446655440004',
      name: 'General Services Department',
      code: 'GSD',
      head: 'Mr. Pedro Gomez',
      budget: 4500000,
      dateEstablished: new Date('1975-06-18'),
      contactEmail: 'gsd@agency.gov.ph',
      contactPhone: '(02) 8567-8901',
      description: 'Handles facilities maintenance and general operations.'
    },
    {
      id: '550e8400e29b41d4a716446655440005',
      name: 'Internal Audit Department',
      code: 'IAD',
      head: 'Ms. Sofia Ramirez',
      budget: 6000000,
      dateEstablished: new Date('2005-09-22'),
      contactEmail: 'audit@agency.gov.ph',
      contactPhone: '(02) 8678-9012',
      description: 'Conducts internal audits and inventory verification.'
    },
    {
      id: '550e8400e29b41d4a716446655440006',
      name: 'Administrative Department',
      code: 'ADM',
      head: 'Mr. Carlos Mendoza',
      budget: 2500000,
      dateEstablished: new Date('1980-04-05'),
      contactEmail: 'admin@agency.gov.ph',
      contactPhone: '(02) 8789-0123',
      description: 'Manages administrative functions and record keeping.'
    },
    {
      id: '550e8400e29b41d4a716446655440007',
      name: 'Asset Management Department',
      code: 'AMD',
      head: 'Mr. Roberto Lim',
      budget: 3200000,
      dateEstablished: new Date('1998-11-15'),
      contactEmail: 'assets@agency.gov.ph',
      contactPhone: '(02) 8890-1234',
      description: 'Oversees asset tracking, maintenance and disposal.'
    }
  ];

  // Dummy Buildings
  const dummyBuildings: Building[] = [
    {
      id: '550e8400e29b41d4a716446655440008',
      name: 'Engineering Building',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 4,
      dateConstructed: new Date('1996-03-25'),
      notes: 'Houses laboratories and classrooms for engineering students.'
    },
    {
      id: '550e8400e29b41d4a716446655440009',
      name: 'Business Administration Building',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 3,
      dateConstructed: new Date('1991-07-12'),
      notes: 'Contains lecture halls and faculty offices for CBA.'
    },
    {
      id: '550e8400e29b41d4a71644665544000A',
      name: 'Education Building',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 5,
      dateConstructed: new Date('1986-09-18'),
      notes: 'Features classrooms and a library for education students.'
    },
    {
      id: '550e8400e29b41d4a71644665544000B',
      name: 'IT Center',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 6,
      dateConstructed: new Date('2001-11-30'),
      notes: 'State-of-the-art facility for IT and Computer Science programs.'
    },
    {
      id: '550e8400e29b41d4a71644665544000C',
      name: 'Agriculture Building',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 2,
      dateConstructed: new Date('1976-08-14'),
      notes: 'Includes laboratories and greenhouses for agricultural studies.'
    },
    {
      id: '550e8400e29b41d4a71644665544000D',
      name: 'Nursing Building',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 4,
      dateConstructed: new Date('2006-12-10'),
      notes: 'Equipped with simulation labs and lecture rooms for nursing students.'
    },
    {
      id: '550e8400e29b41d4a71644665544000E',
      name: 'Arts and Sciences Building',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 3,
      dateConstructed: new Date('1981-05-20'),
      notes: 'Home to classrooms and laboratories for CAS programs.'
    },
    {
      id: '550e8400e29b41d4a71644665544000F',
      name: 'Criminal Justice Building',
      address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
      numberOfFloors: 3,
      dateConstructed: new Date('1999-02-28'),
      notes: 'Facility for CCJE students, including mock courtrooms and labs.'
    }
  ];

 
  // Dummy Offices
  const dummyOffices: Office[] = [
    {
      id: '550e8400e29b41d4a716446655440010',
      name: 'Dean\'s Office - COE',
      roomNumber: '101',
      capacity: 10,
      floor: 1,
      extension: '1101',
      buildingId: dummyBuildings[0].id!,
      departmentId: dummyDepartments[0].id!,
      notes: 'Office of the Dean of Engineering.'
    },
    {
      id: '550e8400e29b41d4a716446655440011',
      name: 'Registrar\'s Office - CBA',
      roomNumber: '201',
      capacity: 8,
      floor: 2,
      extension: '2201',
      buildingId: dummyBuildings[1].id!,
      departmentId: dummyDepartments[1].id!,
      notes: 'Handles student records for CBA.'
    },
    {
      id: '550e8400e29b41d4a716446655440012',
      name: 'Faculty Room - COED',
      roomNumber: '301',
      capacity: 15,
      floor: 3,
      extension: '3301',
      buildingId: dummyBuildings[2].id!,
      departmentId: dummyDepartments[2].id!,
      notes: 'Common room for COED faculty members.'
    },
    {
      id: '550e8400e29b41d4a716446655440013',
      name: 'IT Lab - CIT',
      roomNumber: '401',
      capacity: 20,
      floor: 4,
      extension: '4401',
      buildingId: dummyBuildings[3].id!,
      departmentId: dummyDepartments[3].id!,
      notes: 'Computer laboratory for IT students.'
    },
    {
      id: '550e8400e29b41d4a716446655440014',
      name: 'Dean\'s Office - COA',
      roomNumber: '102',
      capacity: 12,
      floor: 1,
      extension: '1102',
      buildingId: dummyBuildings[4].id!,
      departmentId: dummyDepartments[4].id!,
      notes: 'Office of the Dean of Agriculture.'
    },
    {
      id: '550e8400e29b41d4a716446655440015',
      name: 'Simulation Lab - CON',
      roomNumber: '202',
      capacity: 25,
      floor: 2,
      extension: '2202',
      buildingId: dummyBuildings[5].id!,
      departmentId: dummyDepartments[5].id!,
      notes: 'Simulation lab for nursing students.'
    },
    {
      id: '550e8400e29b41d4a716446655440016',
      name: 'Research Office - CAS',
      roomNumber: '302',
      capacity: 10,
      floor: 3,
      extension: '3302',
      buildingId: dummyBuildings[6].id!,
      departmentId: dummyDepartments[6].id!,
      notes: 'Office for research activities in Arts and Sciences.'
    },
    {
      id: '550e8400e29b41d4a716446655440017',
      name: 'Mock Courtroom - CCJE',
      roomNumber: '402',
      capacity: 30,
      floor: 4,
      extension: '4402',
      buildingId: dummyBuildings[7].id!,
      departmentId: dummyDepartments[7].id!,
      notes: 'Mock courtroom for Criminal Justice students.'
    }
  ];

  this.departments = dummyDepartments;
  this.buildings = dummyBuildings;
  this.offices = dummyOffices;
  this.saveToLocalStorage();
  
}
// Modify the method to return the department name
async getOfficeDepartment(officeId: string): Promise<string> {
  const office = this.offices.find(o => o.id === officeId);
  if (office) {
    const department = this.departments.find(d => d.id === office.departmentId);
    return department?.name || 'N/A';
  }
  return 'N/A';
}


  // CRUD methods for departments
  async getAllDepartments(): Promise<Department[]> {
    return this.departments;
  }

  async addDepartment(department: Omit<Department, 'id'>): Promise<void> {
    const newDepartment = { ...department, id: this.generate32DigitId() };
    this.departments.push(newDepartment);
    this.saveToLocalStorage();
  }

  async editDepartment(department: Department): Promise<void> {
    const index = this.departments.findIndex(d => d.id === department.id);
    if (index !== -1) {
      this.departments[index] = department;
      this.saveToLocalStorage();
    }
  }
  

  async deleteDepartment(id: string): Promise<void> {
    this.departments = this.departments.filter(d => d.id !== id);
    this.offices = this.offices.filter(o => o.departmentId !== id);
    this.saveToLocalStorage();
  }

  // CRUD methods for buildings
  async getAllBuildings(): Promise<Building[]> {
    return this.buildings;
  }

  async addBuilding(building: Omit<Building, 'id'>): Promise<void> {
    const newBuilding = { ...building, id: this.generate32DigitId() };
    this.buildings.push(newBuilding);
    this.saveToLocalStorage();
  }

  async editBuilding(building: Building): Promise<void> {
    const index = this.buildings.findIndex(b => b.id === building.id);
    if (index !== -1) {
      this.buildings[index] = building;
      this.saveToLocalStorage();
    }
  }

  async deleteBuilding(id: string): Promise<void> {
    this.buildings = this.buildings.filter(b => b.id !== id);
    this.offices = this.offices.filter(o => o.buildingId !== id);
    this.saveToLocalStorage();
  }

  // CRUD methods for offices
  async getAllOffices(): Promise<Office[]> {
    return this.offices;
  }

  async addOffice(office: Omit<Office, 'id'>): Promise<void> {
    const newOffice = { ...office, id: this.generate32DigitId() };
    this.offices.push(newOffice);
    this.saveToLocalStorage();
  }

  async editOffice(office: Office): Promise<void> {
    const index = this.offices.findIndex(o => o.id === office.id);
    if (index !== -1) {
      this.offices[index] = office;
      this.saveToLocalStorage();
    }
  }

  async deleteOffice(id: string): Promise<void> {
    this.offices = this.offices.filter(o => o.id !== id);
    this.saveToLocalStorage();
  }

  
}