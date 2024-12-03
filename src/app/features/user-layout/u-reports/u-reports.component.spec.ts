import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UReports } from './u-reports.component';

describe('UReports', () => {
  let component: UReports;
  let fixture: ComponentFixture<UReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UReports]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
