import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedPurchaseRequestsComponent } from './approved-purchase-requests.component';

describe('ApprovedPurchaseRequestsComponent', () => {
  let component: ApprovedPurchaseRequestsComponent;
  let fixture: ComponentFixture<ApprovedPurchaseRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedPurchaseRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedPurchaseRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
