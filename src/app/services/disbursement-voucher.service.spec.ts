import { TestBed } from '@angular/core/testing';

import { DisbursementVoucherService } from './disbursement-voucher.service';

describe('DisbursementVoucherService', () => {
  let service: DisbursementVoucherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisbursementVoucherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
