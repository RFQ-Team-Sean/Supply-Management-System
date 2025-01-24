import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidmanagementBidinvitationComponent } from './bidmanagement-bidinvitation.component';

describe('BidmanagementBidinvitationComponent', () => {
  let component: BidmanagementBidinvitationComponent;
  let fixture: ComponentFixture<BidmanagementBidinvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidmanagementBidinvitationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidmanagementBidinvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
