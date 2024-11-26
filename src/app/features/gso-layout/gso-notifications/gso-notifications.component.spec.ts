import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNotificationsComponent } from './gso-notifications.component';

describe('GsoNotificationsComponent', () => {
  let component: GsoNotificationsComponent;
  let fixture: ComponentFixture<GsoNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNotificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
