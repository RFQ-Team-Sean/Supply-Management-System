import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DViewppmpprocurementComponent } from './d-viewppmpprocurement.component';

describe('DViewppmpprocurementComponent', () => {
  let component: DViewppmpprocurementComponent;
  let fixture: ComponentFixture<DViewppmpprocurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DViewppmpprocurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DViewppmpprocurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
