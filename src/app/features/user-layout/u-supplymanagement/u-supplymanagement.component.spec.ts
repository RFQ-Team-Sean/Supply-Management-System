import { ComponentFixture, TestBed } from '@angular/core/testing';

import { USupplymanagement } from './u-supplymanagement.component';

describe('USupplymanagement', () => {
  let component: USupplymanagement;
  let fixture: ComponentFixture<USupplymanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [USupplymanagement]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(USupplymanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
