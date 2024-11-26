import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewassetbuildingComponent } from './gso-newassetbuilding.component';

describe('GsoNewassetbuildingComponent', () => {
  let component: GsoNewassetbuildingComponent;
  let fixture: ComponentFixture<GsoNewassetbuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewassetbuildingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewassetbuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
