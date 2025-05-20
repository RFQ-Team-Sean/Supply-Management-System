import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuotationRequest } from '../schema/schema';
import { quotationRequestsList } from '../schema/inventory-dummydata';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private quotationRequests = new BehaviorSubject<QuotationRequest[]>([]);
  private readonly STORAGE_KEY = 'quotation_requests';
  
  constructor() {
    // Load data from localStorage first, then fallback to dummy data
    this.loadFromLocalStorage();
  }
  
  private loadFromLocalStorage(): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        // Parse stored data and handle date conversion
        const parsedData = JSON.parse(storedData, (key, value) => {
          // Convert date strings back to Date objects
          if (key === 'dateRequested' || key === 'responseDate' || key === 'estimatedDeliveryDate') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        this.quotationRequests.next(parsedData);
        console.log('Loaded quotation requests from localStorage:', parsedData.length);
      } else {
        // If no data in localStorage, use the dummy data
        this.quotationRequests.next([...quotationRequestsList]);
        // Save initial data to localStorage
        this.saveToLocalStorage();
      }
    } catch (error) {
      console.error('Error loading quotation requests from localStorage:', error);
      // Fallback to dummy data
      this.quotationRequests.next([...quotationRequestsList]);
    }
  }
  
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.quotationRequests.value));
      console.log('Saved quotation requests to localStorage:', this.quotationRequests.value.length);
    } catch (error) {
      console.error('Error saving quotation requests to localStorage:', error);
    }
  }
  
  getQuotationRequests(): Observable<QuotationRequest[]> {
    return this.quotationRequests.asObservable();
  }
  
  getQuotationRequestsByRequester(requesterId: string): Observable<QuotationRequest[]> {
    return this.quotationRequests.asObservable().pipe(
      map(requests => requests.filter(req => req.requesterId === requesterId))
    );
  }
  
  getQuotationRequestsBySupplier(supplierId: string): Observable<QuotationRequest[]> {
    return this.quotationRequests.asObservable().pipe(
      map(requests => requests.filter(req => req.supplierId === supplierId))
    );
  }
  
  addQuotationRequest(request: Partial<QuotationRequest>, requesterId: string): void {
    const currentRequests = this.quotationRequests.value;
    
    const newRequest = new QuotationRequest();
    Object.assign(newRequest, {
      ...request,
      id: `REQ-${String(currentRequests.length + 1).padStart(3, '0')}`,
      dateRequested: new Date(),
      status: 'pending',
      requesterId: requesterId
    });
    
    const updatedRequests = [...currentRequests, newRequest];
    this.quotationRequests.next(updatedRequests);
    
    // Save to localStorage
    this.saveToLocalStorage();
  }
  
  updateQuotationRequest(id: string, updates: Partial<QuotationRequest>): void {
    const currentRequests = this.quotationRequests.value;
    const updatedRequests = currentRequests.map(req => 
      req.id === id ? { ...req, ...updates } : req
    );
    
    this.quotationRequests.next(updatedRequests);
    
    // Save to localStorage
    this.saveToLocalStorage();
  }
  
  // Add method to get a single quotation request by ID
  getQuotationRequestById(id: string): QuotationRequest | undefined {
    return this.quotationRequests.value.find(req => req.id === id);
  }
  
  // Add method to clear all quotation data (useful for testing or reset)
  clearQuotationData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.quotationRequests.next([]);
  }
} 