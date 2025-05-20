import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvassingComponent } from './canvassing.component';

describe('CanvassingComponent', () => {
  let component: CanvassingComponent;
  let fixture: ComponentFixture<CanvassingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvassingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvassingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
