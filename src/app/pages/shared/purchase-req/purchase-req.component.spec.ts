import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReqComponent } from './purchase-req.component';

describe('PurchaseReqComponent', () => {
  let component: PurchaseReqComponent;
  let fixture: ComponentFixture<PurchaseReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseReqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
