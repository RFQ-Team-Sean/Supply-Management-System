import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalVerificationComponent } from './final-verification.component';

describe('FinalVerificationComponent', () => {
  let component: FinalVerificationComponent;
  let fixture: ComponentFixture<FinalVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
