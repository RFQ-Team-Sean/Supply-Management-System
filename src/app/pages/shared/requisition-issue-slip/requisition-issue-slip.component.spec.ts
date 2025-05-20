import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitionIssueSlipComponent } from './requisition-issue-slip.component';

describe('RequisitionIssueSlipComponent', () => {
  let component: RequisitionIssueSlipComponent;
  let fixture: ComponentFixture<RequisitionIssueSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequisitionIssueSlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequisitionIssueSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
