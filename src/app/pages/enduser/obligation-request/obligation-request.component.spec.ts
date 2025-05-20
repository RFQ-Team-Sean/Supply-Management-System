import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObligationRequestComponent } from './obligation-request.component';

describe('ObligationRequestComponent', () => {
  let component: ObligationRequestComponent;
  let fixture: ComponentFixture<ObligationRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObligationRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObligationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
