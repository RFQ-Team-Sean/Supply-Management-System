import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrApprovalComponent } from './pr-approval.component';

describe('PrApprovalComponent', () => {
  let component: PrApprovalComponent;
  let fixture: ComponentFixture<PrApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
