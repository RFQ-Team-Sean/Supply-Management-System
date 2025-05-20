import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { CrudService } from './crud.service';
import { z } from 'zod';
import { SupplierDetails } from '../schema/schema';
import { supplierDetailsList } from '../schema/dummy';

export { SupplierDetails} from '../schema/schema';

// Define the supplier schema using Zod
export const supplierSchema = z.object({
  User_id: z.string(),
  contact_person: z.string(),
  contact_number: z.string().regex(/^\+639\d{9}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  address: z.string(),
  tin_number: z.string(),
  sec_number: z.string(),
  dti_number: z.string(),
  mayors_permit: z.string()
});

export type SupplierType = z.infer<typeof supplierSchema>;

export const SUPPLIER_DATA_VERSION = '1.0';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  constructor(private crudService: CrudService) {
    if (this.shouldInitializeDummyData()) {
      this.initializeDummyData();
    }
  }

  private shouldInitializeDummyData(): boolean {
    const storedData = localStorage.getItem('SupplierDetails');
    const storedVersion = localStorage.getItem('SupplierDetails_version');
    return !storedData || storedVersion !== SUPPLIER_DATA_VERSION;
  }

  private async initializeDummyData(): Promise<void> {
    await this.crudService.flushDummyData(SupplierDetails, supplierDetailsList);
  }

  getAllSuppliers(): Observable<SupplierDetails[]> {
    return from(this.crudService.getAll(SupplierDetails));
  }

  getSupplier(id: string): Observable<SupplierDetails | undefined> {
    return from(this.crudService.get(SupplierDetails, id));
  }

  createSupplier(supplier: SupplierType): Observable<SupplierDetails> {
    const validatedData = supplierSchema.parse(supplier);
    return from(this.crudService.create(SupplierDetails, validatedData));
  }

  updateSupplier(id: string, supplier: Partial<SupplierType>): Observable<SupplierDetails> {
    if (Object.keys(supplier).length > 0) {
      supplierSchema.partial().parse(supplier);
    }
    return from(this.crudService.partial_update(SupplierDetails, id, supplier));
  }

  deleteSupplier(id: string): Observable<SupplierDetails | undefined> {
    return from(this.crudService.delete(SupplierDetails, id));
  }
}