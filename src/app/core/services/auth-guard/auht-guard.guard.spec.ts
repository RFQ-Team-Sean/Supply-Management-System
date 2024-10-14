import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auhtGuardGuard } from './auht-guard.guard';

describe('auhtGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auhtGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
