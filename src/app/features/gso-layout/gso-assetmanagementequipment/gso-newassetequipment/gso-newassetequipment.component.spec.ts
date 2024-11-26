import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewassetequipmentComponent } from './gso-newassetequipment.component';

describe('GsoNewassetequipmentComponent', () => {
  let component: GsoNewassetequipmentComponent;
  let fixture: ComponentFixture<GsoNewassetequipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewassetequipmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewassetequipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
