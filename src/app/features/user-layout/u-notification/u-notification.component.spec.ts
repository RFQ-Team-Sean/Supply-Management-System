import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UNotification } from './u-notification.component';

describe('UNotification', () => {
  let component: UNotification;
  let fixture: ComponentFixture<UNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UNotification]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
