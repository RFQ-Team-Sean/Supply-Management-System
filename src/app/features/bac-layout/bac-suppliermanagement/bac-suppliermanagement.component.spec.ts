import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacSuppliermanagementComponent } from './bac-suppliermanagement.component';

describe('BacSuppliermanagementComponent', () => {
  let component: BacSuppliermanagementComponent;
  let fixture: ComponentFixture<BacSuppliermanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacSuppliermanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BacSuppliermanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
