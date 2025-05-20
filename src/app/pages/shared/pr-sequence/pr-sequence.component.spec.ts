import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrSequenceComponent } from './pr-sequence.component';

describe('PrSequenceComponent', () => {
  let component: PrSequenceComponent;
  let fixture: ComponentFixture<PrSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrSequenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
