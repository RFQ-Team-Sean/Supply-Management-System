import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewitemComponent } from './gso-newitem.component';

describe('GsoNewitemComponent', () => {
  let component: GsoNewitemComponent;
  let fixture: ComponentFixture<GsoNewitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewitemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
