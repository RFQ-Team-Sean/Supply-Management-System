import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AReportsdetailsComponent } from './a-reportsdetails.component';

describe('AReportsdetailsComponent', () => {
  let component: AReportsdetailsComponent;
  let fixture: ComponentFixture<AReportsdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AReportsdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AReportsdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
