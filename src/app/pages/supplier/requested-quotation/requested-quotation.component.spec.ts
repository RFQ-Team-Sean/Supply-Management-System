import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestedQuotationComponent } from './requested-quotation.component';

describe('RequestedQuotationComponent', () => {
  let component: RequestedQuotationComponent;
  let fixture: ComponentFixture<RequestedQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestedQuotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestedQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
