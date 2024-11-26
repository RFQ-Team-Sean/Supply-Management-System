import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoSuppliereditComponent } from './gso-supplieredit.component';

describe('GsoSuppliereditComponent', () => {
  let component: GsoSuppliereditComponent;
  let fixture: ComponentFixture<GsoSuppliereditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoSuppliereditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoSuppliereditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
