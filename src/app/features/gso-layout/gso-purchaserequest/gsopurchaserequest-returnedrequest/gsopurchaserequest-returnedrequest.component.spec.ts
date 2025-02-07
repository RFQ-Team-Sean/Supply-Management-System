import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsopurchaserequestReturnedrequestComponent } from './gsopurchaserequest-returnedrequest.component';

describe('GsopurchaserequestReturnedrequestComponent', () => {
  let component: GsopurchaserequestReturnedrequestComponent;
  let fixture: ComponentFixture<GsopurchaserequestReturnedrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsopurchaserequestReturnedrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsopurchaserequestReturnedrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
