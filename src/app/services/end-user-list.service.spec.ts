import { TestBed } from '@angular/core/testing';

import { EndUserListService } from './end-user-list.service';

describe('EndUserListService', () => {
  let service: EndUserListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndUserListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
