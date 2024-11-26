import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DPrmapprovedrequestComponent } from './d-prmapprovedrequest.component';

describe('DPrmapprovedrequestComponent', () => {
  let component: DPrmapprovedrequestComponent;
  let fixture: ComponentFixture<DPrmapprovedrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DPrmapprovedrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DPrmapprovedrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
