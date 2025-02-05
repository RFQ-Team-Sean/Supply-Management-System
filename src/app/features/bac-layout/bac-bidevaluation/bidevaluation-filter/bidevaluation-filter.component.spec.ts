import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidevaluationFilterComponent } from './bidevaluation-filter.component';

describe('BidevaluationFilterComponent', () => {
  let component: BidevaluationFilterComponent;
  let fixture: ComponentFixture<BidevaluationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidevaluationFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidevaluationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
