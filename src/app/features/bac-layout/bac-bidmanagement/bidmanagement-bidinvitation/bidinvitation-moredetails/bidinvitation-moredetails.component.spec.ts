import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidinvitationMoredetailsComponent } from './bidinvitation-moredetails.component';

describe('BidinvitationMoredetailsComponent', () => {
  let component: BidinvitationMoredetailsComponent;
  let fixture: ComponentFixture<BidinvitationMoredetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidinvitationMoredetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BidinvitationMoredetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
