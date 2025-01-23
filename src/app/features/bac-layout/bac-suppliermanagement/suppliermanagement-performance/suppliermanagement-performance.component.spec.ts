import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliermanagementPerformanceComponent } from './suppliermanagement-performance.component';

describe('SuppliermanagementPerformanceComponent', () => {
  let component: SuppliermanagementPerformanceComponent;
  let fixture: ComponentFixture<SuppliermanagementPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliermanagementPerformanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuppliermanagementPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
