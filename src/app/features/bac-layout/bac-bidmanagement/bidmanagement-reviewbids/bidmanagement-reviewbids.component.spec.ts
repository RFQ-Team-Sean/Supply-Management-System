import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidmanagementReviewbidsComponent } from './bidmanagement-reviewbids.component';

describe('BidmanagementReviewbidsComponent', () => {
  let component: BidmanagementReviewbidsComponent;
  let fixture: ComponentFixture<BidmanagementReviewbidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidmanagementReviewbidsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidmanagementReviewbidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
