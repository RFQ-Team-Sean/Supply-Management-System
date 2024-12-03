import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoPrmapprovedrequestComponent } from './gso-prmapprovedrequest.component';

describe('GsoPrmapprovedrequestComponent', () => {
  let component: GsoPrmapprovedrequestComponent;
  let fixture: ComponentFixture<GsoPrmapprovedrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoPrmapprovedrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoPrmapprovedrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
