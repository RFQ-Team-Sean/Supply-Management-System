import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UCreateprmComponent } from './u-createprm.component';

describe('UCreateprmComponent', () => {
  let component: UCreateprmComponent;
  let fixture: ComponentFixture<UCreateprmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UCreateprmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UCreateprmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
