import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASupplymanagement } from './a-supplymanagement.component';

describe('AReceivedComponent', () => {
  let component: ASupplymanagement;
  let fixture: ComponentFixture<ASupplymanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASupplymanagement]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ASupplymanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
