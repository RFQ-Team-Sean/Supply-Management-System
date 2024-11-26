import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DPpmprejectedprocurementComponent } from './d-ppmprejectedprocurement.component';

describe('DPpmprejectedprocurementComponent', () => {
  let component: DPpmprejectedprocurementComponent;
  let fixture: ComponentFixture<DPpmprejectedprocurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DPpmprejectedprocurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DPpmprejectedprocurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
