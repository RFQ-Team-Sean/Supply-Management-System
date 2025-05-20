import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparePurchasedOrdersComponent } from './prepare-purchased-orders.component';

describe('PreparePurchasedOrdersComponent', () => {
  let component: PreparePurchasedOrdersComponent;
  let fixture: ComponentFixture<PreparePurchasedOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreparePurchasedOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreparePurchasedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
