import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceQuotationComponent } from './price-quotation.component';

describe('PriceQuotationComponent', () => {
  let component: PriceQuotationComponent;
  let fixture: ComponentFixture<PriceQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceQuotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
