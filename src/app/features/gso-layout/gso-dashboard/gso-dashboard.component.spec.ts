import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoDashboardComponent } from './gso-dashboard.component';

describe('GsoDashboardComponent', () => {
  let component: GsoDashboardComponent;
  let fixture: ComponentFixture<GsoDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
