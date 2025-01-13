import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidmanagementBidcanvasComponent } from './bidmanagement-bidcanvas.component';

describe('BidmanagementBidcanvasComponent', () => {
  let component: BidmanagementBidcanvasComponent;
  let fixture: ComponentFixture<BidmanagementBidcanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidmanagementBidcanvasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidmanagementBidcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
