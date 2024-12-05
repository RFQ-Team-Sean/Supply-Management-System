import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoPrmrejectrequestComponent } from './gso-prmrejectrequest.component';

describe('GsoPrmrejectrequestComponent', () => {
  let component: GsoPrmrejectrequestComponent;
  let fixture: ComponentFixture<GsoPrmrejectrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoPrmrejectrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoPrmrejectrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
