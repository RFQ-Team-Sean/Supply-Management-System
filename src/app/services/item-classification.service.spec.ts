import { TestBed } from '@angular/core/testing';

import { ItemClassificationService } from './item-classification.service';

describe('ItemClassificationService', () => {
  let service: ItemClassificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemClassificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
