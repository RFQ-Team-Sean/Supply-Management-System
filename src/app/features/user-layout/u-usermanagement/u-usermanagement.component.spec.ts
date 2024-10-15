import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UUsermanagement } from './u-usermanagement.component';

describe('UUsermanagement', () => {
  let component: UUsermanagement;
  let fixture: ComponentFixture<UUsermanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UUsermanagement]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UUsermanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
