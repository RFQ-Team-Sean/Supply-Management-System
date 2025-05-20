import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationToBidComponent } from './invitation-to-bid.component';

describe('InvitationToBidComponent', () => {
  let component: InvitationToBidComponent;
  let fixture: ComponentFixture<InvitationToBidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationToBidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationToBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
