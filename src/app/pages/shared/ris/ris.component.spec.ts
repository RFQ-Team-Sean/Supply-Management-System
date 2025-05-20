import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisComponent } from './ris.component';

describe('RisComponent', () => {
  let component: RisComponent;
  let fixture: ComponentFixture<RisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
