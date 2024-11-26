import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewassetmachineryComponent } from './gso-newassetmachinery.component';

describe('GsoNewassetmachineryComponent', () => {
  let component: GsoNewassetmachineryComponent;
  let fixture: ComponentFixture<GsoNewassetmachineryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewassetmachineryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewassetmachineryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
