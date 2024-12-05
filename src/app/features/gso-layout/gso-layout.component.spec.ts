import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoLayoutComponent } from './gso-layout.component';

describe('GsoLayoutComponent', () => {
  let component: GsoLayoutComponent;
  let fixture: ComponentFixture<GsoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
