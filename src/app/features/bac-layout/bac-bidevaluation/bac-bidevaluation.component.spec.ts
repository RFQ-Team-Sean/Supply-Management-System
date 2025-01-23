import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacBidevaluationComponent } from './bac-bidevaluation.component';

describe('BacBidevaluationComponent', () => {
  let component: BacBidevaluationComponent;
  let fixture: ComponentFixture<BacBidevaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacBidevaluationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BacBidevaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
