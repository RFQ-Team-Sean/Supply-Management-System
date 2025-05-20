import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualProcurementPlanComponent } from './annual-procurement-plan.component';

describe('AnnualProcurementPlanComponent', () => {
  let component: AnnualProcurementPlanComponent;
  let fixture: ComponentFixture<AnnualProcurementPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualProcurementPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualProcurementPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
