import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoInventorymanagementComponent } from './gso-inventorymanagement.component';

describe('GsoInventorymanagementComponent', () => {
  let component: GsoInventorymanagementComponent;
  let fixture: ComponentFixture<GsoInventorymanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoInventorymanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoInventorymanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
