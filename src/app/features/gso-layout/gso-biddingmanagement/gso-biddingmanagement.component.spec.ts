import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoBiddingmanagementComponent } from './gso-biddingmanagement.component';

describe('GsoBiddingmanagementComponent', () => {
  let component: GsoBiddingmanagementComponent;
  let fixture: ComponentFixture<GsoBiddingmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoBiddingmanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoBiddingmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
