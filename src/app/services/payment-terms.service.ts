// src/app/services/payment-terms.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { z } from 'zod';

export const paymentTermSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  days: z.number().min(0, "Days must be a positive number"),
  percentageRequired: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type PaymentTerm = z.infer<typeof paymentTermSchema>;

@Injectable({
  providedIn: 'root'
})
export class PaymentTermsService {
  private terms: PaymentTerm[] = [];
  private readonly TERMS_STORAGE_KEY = 'payment_terms_data';

  constructor() {
    this.loadTerms();
    this.initializeDefaultTerms();
  }

  private initializeDefaultTerms() {
    if (this.terms.length === 0) {
      const defaultTerms: Omit<PaymentTerm, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          code: 'COD',
          name: 'Cash on Delivery',
          description: 'Payment is due at the time of delivery',
          days: 0,
          percentageRequired: 100,
          isActive: true
        },
        {
          code: 'NET30',
          name: 'Net 30',
          description: 'Payment is due within 30 days',
          days: 30,
          percentageRequired: 100,
          isActive: true
        },
        {
          code: 'NET60',
          name: 'Net 60',
          description: 'Payment is due within 60 days',
          days: 60,
          percentageRequired: 100,
          isActive: true
        },
        {
          code: '50-50',
          name: '50% Advance Payment',
          description: '50% payment upfront, 50% upon delivery',
          days: 0,
          percentageRequired: 50,
          isActive: true
        }
      ];

      defaultTerms.forEach(term => {
        this.addTerm(term).subscribe();
      });
    }
  }

  private generateId(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private loadTerms() {
    const storedTerms = localStorage.getItem(this.TERMS_STORAGE_KEY);
    if (storedTerms) {
      const parsedTerms = JSON.parse(storedTerms);
      this.terms = parsedTerms.map((term: any) => ({
        ...term,
        createdAt: term.createdAt ? new Date(term.createdAt) : new Date(),
        updatedAt: term.updatedAt ? new Date(term.updatedAt) : new Date()
      }));
    }
  }

  private saveTerms() {
    localStorage.setItem(this.TERMS_STORAGE_KEY, JSON.stringify(this.terms));
  }

  getAllTerms(): Observable<PaymentTerm[]> {
    return of(this.terms);
  }

  getActiveTerns(): Observable<PaymentTerm[]> {
    return of(this.terms.filter(term => term.isActive));
  }

  getTermById(termId: string): Observable<PaymentTerm | undefined> {
    const term = this.terms.find(t => t.id === termId);
    return of(term);
  }

  addTerm(termData: Omit<PaymentTerm, 'id' | 'createdAt' | 'updatedAt'>): Observable<PaymentTerm> {
    try {
      // Check if code already exists
      if (this.terms.some(t => t.code === termData.code)) {
        return throwError(() => new Error('Payment term code already exists'));
      }

      const newTerm: PaymentTerm = {
        ...termData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      paymentTermSchema.parse(newTerm);
      this.terms.push(newTerm);
      this.saveTerms();

      return of(newTerm);
    } catch (error) {
      return throwError(() => error);
    }
  }

  updateTerm(termId: string, termData: Partial<PaymentTerm>): Observable<PaymentTerm> {
    try {
      const termIndex = this.terms.findIndex(t => t.id === termId);
      if (termIndex === -1) {
        return throwError(() => new Error('Payment term not found'));
      }

      // Check if code is being changed and is unique
      if (
        termData.code &&
        termData.code !== this.terms[termIndex].code &&
        this.terms.some(t => t.code === termData.code)
      ) {
        return throwError(() => new Error('Payment term code already exists'));
      }

      const updatedTerm: PaymentTerm = {
        ...this.terms[termIndex],
        ...termData,
        id: termId,
        updatedAt: new Date()
      };

      paymentTermSchema.parse(updatedTerm);
      this.terms[termIndex] = updatedTerm;
      this.saveTerms();

      return of(updatedTerm);
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteTerm(termId: string): Observable<boolean> {
    const termIndex = this.terms.findIndex(t => t.id === termId);
    if (termIndex === -1) {
      return throwError(() => new Error('Payment term not found'));
    }

    this.terms.splice(termIndex, 1);
    this.saveTerms();

    return of(true);
  }

  resetTerms(): Observable<boolean> {
    this.terms = [];
    this.saveTerms();
    this.initializeDefaultTerms();
    return of(true);
  }
}