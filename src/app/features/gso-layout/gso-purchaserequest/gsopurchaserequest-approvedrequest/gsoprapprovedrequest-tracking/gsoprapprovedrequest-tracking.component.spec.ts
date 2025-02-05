import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoprapprovedrequestTrackingComponent } from './gsoprapprovedrequest-tracking.component';

describe('GsoprapprovedrequestTrackingComponent', () => {
  let component: GsoprapprovedrequestTrackingComponent;
  let fixture: ComponentFixture<GsoprapprovedrequestTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoprapprovedrequestTrackingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoprapprovedrequestTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
