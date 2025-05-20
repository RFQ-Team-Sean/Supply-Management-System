import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionDashboardComponent } from './inspection-dashboard.component';

describe('InspectionDashboardComponent', () => {
  let component: InspectionDashboardComponent;
  let fixture: ComponentFixture<InspectionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
