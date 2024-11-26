import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DPpmpapprovedprocurementComponent } from './d-ppmpapprovedprocurement.component';

describe('DPpmpapprovedprocurementComponent', () => {
  let component: DPpmpapprovedprocurementComponent;
  let fixture: ComponentFixture<DPpmpapprovedprocurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DPpmpapprovedprocurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DPpmpapprovedprocurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
