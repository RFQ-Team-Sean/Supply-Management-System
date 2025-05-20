// services/procurement.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProcurementItem, DocumentMetadata, ProcurementCategory } from '../pages/shared/app-shared/procurement.interface';
import { PROCUREMENT_DATA } from '../pages/shared/app-shared/procurement-data';

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
  private documentData = new BehaviorSubject<any>(PROCUREMENT_DATA);
  private editMode = new BehaviorSubject<boolean>(false);

  constructor() {}

  getDocumentData(): Observable<any> {
    return this.documentData.asObservable();
  }

  getEditMode(): Observable<boolean> {
    return this.editMode.asObservable();
  }

  toggleEditMode(): void {
    this.editMode.next(!this.editMode.value);
  }

  updateItem(categoryIndex: number, itemIndex: number, updatedItem: ProcurementItem): void {
    const currentData = { ...this.documentData.value };
    currentData.categories[categoryIndex].items[itemIndex] = {
      ...currentData.categories[categoryIndex].items[itemIndex],
      ...updatedItem
    };
    this.documentData.next(currentData);
  }

  calculateTotals(category: ProcurementCategory) {
    return category.items.reduce((acc, item) => ({
      totalBudget: acc.totalBudget + item.totalBudget,
      totalMOOE: acc.totalMOOE + item.mooe,
      totalCO: acc.totalCO + item.co
    }), { totalBudget: 0, totalMOOE: 0, totalCO: 0 });
  }

  calculateGrandTotal() {
    return this.documentData.value.categories.reduce((acc: any, category: ProcurementCategory) => {
      const totals = this.calculateTotals(category);
      return {
        totalBudget: acc.totalBudget + totals.totalBudget,
        totalMOOE: acc.totalMOOE + totals.totalMOOE,
        totalCO: acc.totalCO + totals.totalCO
      };
    }, { totalBudget: 0, totalMOOE: 0, totalCO: 0 });
  }

  exportToPDF(): void {
    window.print();
  }
}