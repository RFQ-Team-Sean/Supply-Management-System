import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoPrmfilterComponent } from './gso-prmfilter.component';

describe('GsoPrmfilterComponent', () => {
  let component: GsoPrmfilterComponent;
  let fixture: ComponentFixture<GsoPrmfilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoPrmfilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoPrmfilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
