import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidmanagementCreateComponent } from './bidmanagement-create.component';

describe('BidmanagementCreateComponent', () => {
  let component: BidmanagementCreateComponent;
  let fixture: ComponentFixture<BidmanagementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidmanagementCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidmanagementCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
