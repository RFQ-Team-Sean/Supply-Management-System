import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UPurchasemanagement } from './u-purchaserequest.component';

describe('UIncomingComponent', () => {
  let component: UPurchasemanagement;
  let fixture: ComponentFixture<UPurchasemanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UPurchasemanagement]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UPurchasemanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
