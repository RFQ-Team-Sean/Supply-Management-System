import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewassetlandComponent } from './gso-newassetland.component';

describe('GsoNewassetlandComponent', () => {
  let component: GsoNewassetlandComponent;
  let fixture: ComponentFixture<GsoNewassetlandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewassetlandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewassetlandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
