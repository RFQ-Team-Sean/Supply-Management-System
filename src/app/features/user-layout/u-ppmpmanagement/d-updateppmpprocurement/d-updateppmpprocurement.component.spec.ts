import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DUpdateppmpprocurementComponent } from './d-updateppmpprocurement.component';

describe('DUpdateppmpprocurementComponent', () => {
  let component: DUpdateppmpprocurementComponent;
  let fixture: ComponentFixture<DUpdateppmpprocurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DUpdateppmpprocurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DUpdateppmpprocurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
