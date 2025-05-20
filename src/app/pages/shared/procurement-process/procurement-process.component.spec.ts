import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementProcessComponent } from './procurement-process.component';

describe('ProcurementProcessComponent', () => {
  let component: ProcurementProcessComponent;
  let fixture: ComponentFixture<ProcurementProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcurementProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
