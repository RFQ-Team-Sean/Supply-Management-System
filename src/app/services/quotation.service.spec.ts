import { TestBed } from '@angular/core/testing';
import { QuotationService } from './quotation.service';
import { QuotationRequest } from '../schema/schema';
import { quotationRequestsList } from '../schema/inventory-dummydata';

describe('QuotationService', () => {
  let service: QuotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuotationService);
    // Reset the service to its initial state before each test
    service['quotationRequests'].next([...quotationRequestsList]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with dummy data', () => {
    service.getQuotationRequests().subscribe(requests => {
      expect(requests).toEqual(quotationRequestsList);
      expect(requests.length).toBe(quotationRequestsList.length);
    });
  });

  it('should add a new quotation request', () => {
    const initialLength = quotationRequestsList.length;
    const newRequest: Partial<QuotationRequest> = {
      supplierId: 'SUPP-001',
      subject: 'Test Subject',
      message: 'Test Message',
      attachments: [],
      supplierName: 'Test Supplier',
      supplierContact: '09123456789',
      supplierEmail: 'supplier@example.com'
    };

    service.addQuotationRequest(newRequest);

    service.getQuotationRequests().subscribe(requests => {
      expect(requests.length).toBe(initialLength + 1);
      const added = requests[requests.length - 1];
      expect(added.supplierName).toBe('Test Supplier');
      expect(added.supplierEmail).toBe('supplier@example.com');
      expect(added.message).toBe('Test Message');
      expect(added.status).toBe('pending');
      expect(added.id).toBe(`REQ-${String(initialLength + 1).padStart(3, '0')}`);
      expect(added.dateRequested).toBeTruthy();
    });
  });

  it('should update an existing quotation request', () => {
    const testId = quotationRequestsList[0].id;
    const updates: Partial<QuotationRequest> = {
      supplierName: 'Updated Name',
      status: 'approved'
    };

    service.updateQuotationRequest(testId, updates);

    service.getQuotationRequests().subscribe(requests => {
      const updated = requests.find(req => req.id === testId);
      expect(updated).toBeTruthy();
      expect(updated?.supplierName).toBe('Updated Name');
      expect(updated?.status).toBe('approved');
      // Other properties should remain unchanged
      expect(updated?.supplierEmail).toBe(quotationRequestsList[0].supplierEmail);
    });
  });

  it('should not affect other requests when updating one request', () => {
    const testId = quotationRequestsList[0].id;
    const otherIds = quotationRequestsList.slice(1).map(req => req.id);
    
    service.updateQuotationRequest(testId, { supplierName: 'Updated Name' });

    service.getQuotationRequests().subscribe(requests => {
      // Check that other items are not modified
      otherIds.forEach(id => {
        const originalItem = quotationRequestsList.find(req => req.id === id);
        const currentItem = requests.find(req => req.id === id);
        expect(currentItem).toEqual(originalItem);
      });
    });
  });
}); 