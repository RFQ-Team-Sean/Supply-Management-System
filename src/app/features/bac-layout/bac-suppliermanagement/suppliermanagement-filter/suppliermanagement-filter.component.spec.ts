import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliermanagementFilterComponent } from './suppliermanagement-filter.component';

describe('SuppliermanagementFilterComponent', () => {
  let component: SuppliermanagementFilterComponent;
  let fixture: ComponentFixture<SuppliermanagementFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliermanagementFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuppliermanagementFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
