import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidmanagmentFilterComponent } from './bidmanagment-filter.component';

describe('BidmanagmentFilterComponent', () => {
  let component: BidmanagmentFilterComponent;
  let fixture: ComponentFixture<BidmanagmentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidmanagmentFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidmanagmentFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
