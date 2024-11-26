import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewassetvihiclesComponent } from './gso-newassetvihicles.component';

describe('GsoNewassetvihiclesComponent', () => {
  let component: GsoNewassetvihiclesComponent;
  let fixture: ComponentFixture<GsoNewassetvihiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewassetvihiclesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewassetvihiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
