import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoProfileComponent } from './gso-profile.component';

describe('GsoProfileComponent', () => {
  let component: GsoProfileComponent;
  let fixture: ComponentFixture<GsoProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
