import { TestBed } from '@angular/core/testing';

import { DeliveryReceiptService } from './delivery-receipt.service';

describe('DeliveryReceiptService', () => {
  let service: DeliveryReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
