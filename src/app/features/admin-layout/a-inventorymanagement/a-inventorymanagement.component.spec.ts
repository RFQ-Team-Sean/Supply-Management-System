import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AInventorymanagement } from './a-inventorymanagement.component';

describe('AInventorymanagement', () => {
  let component: AInventorymanagement;
  let fixture: ComponentFixture<AInventorymanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AInventorymanagement]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AInventorymanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
