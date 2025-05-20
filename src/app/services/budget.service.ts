// src/app/services/budget.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { z } from 'zod';
import { UserService } from './user.service';

export const budgetAllocationSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  userId: z.union([z.string(), z.number()]),
  fiscalYear: z.number().int().min(2000, "Invalid fiscal year"),
  totalBudget: z.number().min(0, "Budget must be non-negative"),
  allocatedAmount: z.number().min(0, "Allocated amount must be non-negative"),
  remainingBalance: z.number().min(0, "Remaining balance must be non-negative"),
  remarks: z.string().max(500, "Remarks cannot exceed 500 characters").optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional()
});



export type BudgetAllocation = z.infer<typeof budgetAllocationSchema>;

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private budgetAllocations: BudgetAllocation[] = [];
  private readonly BUDGET_STORAGE_KEY = 'budget_allocations';

  constructor(private userService: UserService) {
    this.loadFromStorage();
    if (!this.budgetAllocations.length) {
      this.initializeDummyData();
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.BUDGET_STORAGE_KEY);
    if (stored) {
      this.budgetAllocations = JSON.parse(stored);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.BUDGET_STORAGE_KEY, JSON.stringify(this.budgetAllocations));
  }

  private initializeDummyData(): void {
    this.budgetAllocations = [
      {
        id: '550e8400e29b41d4a716446655440101',
        userId: '6', // Diana Green
        fiscalYear: 2025,
        totalBudget: 1000000,
        allocatedAmount: 500000,
        remainingBalance: 500000,
        remarks: 'Budget approved for end-user Diana Green',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400e29b41d4a716446655440102',
        userId: '7', // Dr. Maria Santos
        fiscalYear: 2025,
        totalBudget: 800000,
        allocatedAmount: 300000,
        remainingBalance: 500000,
        remarks: 'Awaiting approval for Dr. Maria Santos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400e29b41d4a716446655440103',
        userId: '8', // Dr. Juan Dela Cruz
        fiscalYear: 2025,
        totalBudget: 900000,
        allocatedAmount: 700000,
        remainingBalance: 200000,
        remarks: 'Draft budget for Dr. Juan Dela Cruz',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400e29b41d4a716446655440104',
        userId: '9', // Dr. Ana Reyes
        fiscalYear: 2025,
        totalBudget: 750000,
        allocatedAmount: 500000,
        remainingBalance: 250000,
        remarks: 'Budget approved for Dr. Ana Reyes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400e29b41d4a716446655440105',
        userId: '10', // Dr. Michael Tan
        fiscalYear: 2025,
        totalBudget: 1200000,
        allocatedAmount: 800000,
        remainingBalance: 400000,
        remarks: 'Budget rejected due to inconsistencies',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.saveToStorage();
  }

  getAllBudgetAllocations(): Observable<BudgetAllocation[]> {
    return of(this.budgetAllocations);
  }

  getBudgetAllocationsByUser(userId: string): Observable<BudgetAllocation[]> {
    return of(this.budgetAllocations.filter(b => b.userId === userId));
  }

  private generateId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}


 
addBudgetAllocation(allocation: Omit<BudgetAllocation, 'id'>): Observable<BudgetAllocation> {
  try {
    if (!allocation.userId) { // ✅ Allow numeric user IDs
      return throwError(() => new Error('Invalid User ID. Please select a valid user.'));
    }

    const newAllocation: BudgetAllocation = {
      ...allocation,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    budgetAllocationSchema.parse(newAllocation); // ✅ Schema now allows numbers

    this.budgetAllocations.push(newAllocation);
    this.saveToStorage();

    return of(newAllocation);
  } catch (error) {
    return throwError(() => error);
  }
}




  updateBudgetAllocation(id: string, update: Partial<BudgetAllocation>): Observable<BudgetAllocation> {
    try {
      const index = this.budgetAllocations.findIndex(b => b.id === id);
      if (index === -1) {
        return throwError(() => new Error('Budget allocation not found'));
      }

      const updatedAllocation: BudgetAllocation = {
        ...this.budgetAllocations[index],
        ...update,
        updatedAt: new Date()
      };

      budgetAllocationSchema.parse(updatedAllocation);
      this.budgetAllocations[index] = updatedAllocation;
      this.saveToStorage();

      return of(updatedAllocation);
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteBudgetAllocation(id: string): Observable<boolean> {
  const index = this.budgetAllocations.findIndex(b => b.id === id);
  if (index === -1) {
    return throwError(() => new Error('Budget allocation not found'));
  }

  this.budgetAllocations.splice(index, 1);
  this.saveToStorage();
  return of(true);
}

}
