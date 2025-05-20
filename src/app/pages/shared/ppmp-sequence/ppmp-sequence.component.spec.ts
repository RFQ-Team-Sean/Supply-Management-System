import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmpSequenceComponent } from './ppmp-sequence.component';

describe('PpmpSequenceComponent', () => {
  let component: PpmpSequenceComponent;
  let fixture: ComponentFixture<PpmpSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpmpSequenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpmpSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
