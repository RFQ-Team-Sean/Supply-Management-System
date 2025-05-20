import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetUtilizationComponent } from './budget-utilization.component';

describe('BudgetUtilizationComponent', () => {
  let component: BudgetUtilizationComponent;
  let fixture: ComponentFixture<BudgetUtilizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetUtilizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetUtilizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
