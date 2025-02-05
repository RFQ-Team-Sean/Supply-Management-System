import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsopurchaserequestApprovedrequestComponent } from './gsopurchaserequest-approvedrequest.component';

describe('GsopurchaserequestApprovedrequestComponent', () => {
  let component: GsopurchaserequestApprovedrequestComponent;
  let fixture: ComponentFixture<GsopurchaserequestApprovedrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsopurchaserequestApprovedrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsopurchaserequestApprovedrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
