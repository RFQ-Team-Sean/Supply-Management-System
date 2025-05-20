import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateApprovedRequestComponent } from './validate-approved-request.component';

describe('ValidateApprovedRequestComponent', () => {
  let component: ValidateApprovedRequestComponent;
  let fixture: ComponentFixture<ValidateApprovedRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateApprovedRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateApprovedRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
