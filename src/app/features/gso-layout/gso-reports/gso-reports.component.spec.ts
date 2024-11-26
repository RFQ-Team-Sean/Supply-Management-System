import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoReportsComponent } from './gso-reports.component';

describe('GsoReportsComponent', () => {
  let component: GsoReportsComponent;
  let fixture: ComponentFixture<GsoReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
