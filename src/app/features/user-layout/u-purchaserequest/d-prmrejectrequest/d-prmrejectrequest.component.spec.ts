import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DPrmrejectrequestComponent } from './d-prmrejectrequest.component';

describe('DPrmrejectrequestComponent', () => {
  let component: DPrmrejectrequestComponent;
  let fixture: ComponentFixture<DPrmrejectrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DPrmrejectrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DPrmrejectrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
