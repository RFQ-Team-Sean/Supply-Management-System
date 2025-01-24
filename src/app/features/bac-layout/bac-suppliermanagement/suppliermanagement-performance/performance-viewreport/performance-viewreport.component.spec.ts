import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceViewreportComponent } from './performance-viewreport.component';

describe('PerformanceViewreportComponent', () => {
  let component: PerformanceViewreportComponent;
  let fixture: ComponentFixture<PerformanceViewreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceViewreportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerformanceViewreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
