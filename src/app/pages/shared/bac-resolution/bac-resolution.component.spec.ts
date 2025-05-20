import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacResolutionComponent } from './bac-resolution.component';

describe('BacResolutionComponent', () => {
  let component: BacResolutionComponent;
  let fixture: ComponentFixture<BacResolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacResolutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BacResolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
