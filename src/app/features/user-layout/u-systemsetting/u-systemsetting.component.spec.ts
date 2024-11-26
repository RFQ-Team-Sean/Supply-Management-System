import { ComponentFixture, TestBed } from '@angular/core/testing';

import { USystemsetting } from './u-systemsetting.component';

describe('USystemsetting', () => {
  let component: USystemsetting;
  let fixture: ComponentFixture<USystemsetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [USystemsetting]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(USystemsetting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
