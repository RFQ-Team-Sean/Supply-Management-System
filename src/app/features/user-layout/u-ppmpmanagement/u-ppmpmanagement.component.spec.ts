import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UPpmpmanagement } from './u-ppmpmanagement.component';

describe('UUsermanagement', () => {
  let component: UPpmpmanagement;
  let fixture: ComponentFixture<UPpmpmanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UPpmpmanagement]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UPpmpmanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
