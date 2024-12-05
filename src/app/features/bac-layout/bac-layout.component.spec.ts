import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacLayoutComponent } from './bac-layout.component';

describe('BacLayoutComponent', () => {
  let component: BacLayoutComponent;
  let fixture: ComponentFixture<BacLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BacLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
