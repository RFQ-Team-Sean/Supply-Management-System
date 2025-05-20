import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppApprovalComponent } from './app-approval.component';

describe('AppApprovalComponent', () => {
  let component: AppApprovalComponent;
  let fixture: ComponentFixture<AppApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
