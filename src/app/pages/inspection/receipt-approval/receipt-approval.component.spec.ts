import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptApprovalComponent } from './receipt-approval.component';

describe('ReceiptApprovalComponent', () => {
  let component: ReceiptApprovalComponent;
  let fixture: ComponentFixture<ReceiptApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiptApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
