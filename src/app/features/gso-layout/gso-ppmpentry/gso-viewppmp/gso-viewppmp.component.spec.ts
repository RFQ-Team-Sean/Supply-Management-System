import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoViewppmpComponent } from './gso-viewppmp.component';

describe('GsoViewppmpComponent', () => {
  let component: GsoViewppmpComponent;
  let fixture: ComponentFixture<GsoViewppmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoViewppmpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoViewppmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
