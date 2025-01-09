import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacBidmanagementComponent } from './bac-bidmanagement.component';

describe('BacBidmanagementComponent', () => {
  let component: BacBidmanagementComponent;
  let fixture: ComponentFixture<BacBidmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacBidmanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BacBidmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
