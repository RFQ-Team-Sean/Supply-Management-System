import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidevaluationEvaluateComponent } from './bidevaluation-evaluate.component';

describe('BidevaluationEvaluateComponent', () => {
  let component: BidevaluationEvaluateComponent;
  let fixture: ComponentFixture<BidevaluationEvaluateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidevaluationEvaluateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidevaluationEvaluateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
