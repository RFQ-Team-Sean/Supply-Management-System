import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UInventorymanagement } from './u-inventorymanagement.component';

describe('UCompletedComponent', () => {
  let component: UInventorymanagement;
  let fixture: ComponentFixture<UInventorymanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UInventorymanagement]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UInventorymanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
