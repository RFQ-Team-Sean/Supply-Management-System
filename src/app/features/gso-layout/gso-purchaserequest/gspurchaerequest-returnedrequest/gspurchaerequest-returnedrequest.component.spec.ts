import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GspurchaerequestReturnedrequestComponent } from './gspurchaerequest-returnedrequest.component';

describe('GspurchaerequestReturnedrequestComponent', () => {
  let component: GspurchaerequestReturnedrequestComponent;
  let fixture: ComponentFixture<GspurchaerequestReturnedrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GspurchaerequestReturnedrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GspurchaerequestReturnedrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
