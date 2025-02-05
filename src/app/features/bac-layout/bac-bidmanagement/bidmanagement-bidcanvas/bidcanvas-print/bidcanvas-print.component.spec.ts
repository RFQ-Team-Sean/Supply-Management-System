import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidcanvasPrintComponent } from './bidcanvas-print.component';

describe('BidcanvasPrintComponent', () => {
  let component: BidcanvasPrintComponent;
  let fixture: ComponentFixture<BidcanvasPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidcanvasPrintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidcanvasPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
