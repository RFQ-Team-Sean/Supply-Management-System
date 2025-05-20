import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalSequenceComponent } from './approval-sequence.component';

describe('ApprovalSequenceComponent', () => {
  let component: ApprovalSequenceComponent;
  let fixture: ComponentFixture<ApprovalSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalSequenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
