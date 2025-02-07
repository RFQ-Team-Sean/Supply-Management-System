import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsopurchaserequestFilterComponent } from './gsopurchaserequest-filter.component';

describe('GsopurchaserequestFilterComponent', () => {
  let component: GsopurchaserequestFilterComponent;
  let fixture: ComponentFixture<GsopurchaserequestFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsopurchaserequestFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsopurchaserequestFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
