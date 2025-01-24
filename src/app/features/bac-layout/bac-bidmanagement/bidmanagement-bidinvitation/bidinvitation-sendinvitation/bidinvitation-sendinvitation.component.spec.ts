import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidinvitationSendinvitationComponent } from './bidinvitation-sendinvitation.component';

describe('BidinvitationSendinvitationComponent', () => {
  let component: BidinvitationSendinvitationComponent;
  let fixture: ComponentFixture<BidinvitationSendinvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidinvitationSendinvitationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidinvitationSendinvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
