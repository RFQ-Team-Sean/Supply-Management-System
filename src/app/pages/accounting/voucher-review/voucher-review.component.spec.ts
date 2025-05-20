import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherReviewComponent } from './voucher-review.component';

describe('VoucherReviewComponent', () => {
  let component: VoucherReviewComponent;
  let fixture: ComponentFixture<VoucherReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
