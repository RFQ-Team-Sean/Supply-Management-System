import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DPrmfilterComponent } from './d-prmfilter.component';

describe('DPrmfilterComponent', () => {
  let component: DPrmfilterComponent;
  let fixture: ComponentFixture<DPrmfilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DPrmfilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DPrmfilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
