import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidevaluationWinningbidComponent } from './bidevaluation-winningbid.component';

describe('BidevaluationWinningbidComponent', () => {
  let component: BidevaluationWinningbidComponent;
  let fixture: ComponentFixture<BidevaluationWinningbidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidevaluationWinningbidComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidevaluationWinningbidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
