import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoPurchaserequestComponent } from './gso-purchaserequest.component';

describe('GsoPurchaserequestComponent', () => {
  let component: GsoPurchaserequestComponent;
  let fixture: ComponentFixture<GsoPurchaserequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoPurchaserequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoPurchaserequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
