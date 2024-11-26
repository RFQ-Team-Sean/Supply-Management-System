import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ANotification } from './a-notification.component';

describe('ANotification', () => {
  let component: ANotification;
  let fixture: ComponentFixture<ANotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ANotification]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ANotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
