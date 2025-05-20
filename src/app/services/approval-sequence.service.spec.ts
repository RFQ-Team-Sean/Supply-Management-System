import { TestBed } from '@angular/core/testing';

import { ApprovalSequenceService } from './approval-sequence.service';

describe('ApprovalSequenceService', () => {
  let service: ApprovalSequenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApprovalSequenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
