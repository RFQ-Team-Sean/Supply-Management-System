import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveredStockComponent } from './delivered-stock.component';

describe('DeliveredStockComponent', () => {
  let component: DeliveredStockComponent;
  let fixture: ComponentFixture<DeliveredStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveredStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveredStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
