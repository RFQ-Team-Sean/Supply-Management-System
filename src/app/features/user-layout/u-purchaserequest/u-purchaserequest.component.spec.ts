import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UPurchaserequestComponent } from './u-purchaserequest.component';

describe('UIncomingComponent', () => {
  let component: UPurchaserequestComponent;
  let fixture: ComponentFixture<UPurchaserequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UPurchaserequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UPurchaserequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
