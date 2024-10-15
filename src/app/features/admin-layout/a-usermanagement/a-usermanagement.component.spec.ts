import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AUsermanagementComponent } from './a-usermanagementcomponent';

describe('ACompletedComponent', () => {
  let component: AUsermanagementComponent;
  let fixture: ComponentFixture<AUsermanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AUsermanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AUsermanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
