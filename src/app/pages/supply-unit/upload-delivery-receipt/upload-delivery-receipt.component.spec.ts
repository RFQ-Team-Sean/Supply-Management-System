import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDeliveryReceiptComponent } from './upload-delivery-receipt.component';

describe('UploadDeliveryReceiptComponent', () => {
  let component: UploadDeliveryReceiptComponent;
  let fixture: ComponentFixture<UploadDeliveryReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDeliveryReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDeliveryReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
