import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractQuotationComponent } from './abstract-quotation.component';

describe('AbstractQuotationComponent', () => {
  let component: AbstractQuotationComponent;
  let fixture: ComponentFixture<AbstractQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbstractQuotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbstractQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
