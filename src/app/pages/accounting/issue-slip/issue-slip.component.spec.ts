import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueSlipComponent } from './issue-slip.component';

describe('IssueSlipComponent', () => {
  let component: IssueSlipComponent;
  let fixture: ComponentFixture<IssueSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueSlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
