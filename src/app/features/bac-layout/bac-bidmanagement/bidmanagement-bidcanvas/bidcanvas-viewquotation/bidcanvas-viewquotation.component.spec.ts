import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidcanvasViewquotationComponent } from './bidcanvas-viewquotation.component';

describe('BidcanvasViewquotationComponent', () => {
  let component: BidcanvasViewquotationComponent;
  let fixture: ComponentFixture<BidcanvasViewquotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidcanvasViewquotationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidcanvasViewquotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
