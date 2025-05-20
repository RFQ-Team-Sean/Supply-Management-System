import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrdersAdminComponent } from './purchase-orders-admin.component';

describe('PurchaseOrdersAdminComponent', () => {
  let component: PurchaseOrdersAdminComponent;
  let fixture: ComponentFixture<PurchaseOrdersAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrdersAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrdersAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
