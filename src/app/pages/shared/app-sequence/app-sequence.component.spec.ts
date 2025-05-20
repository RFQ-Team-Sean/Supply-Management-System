import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSequenceComponent } from './app-sequence.component';

describe('AppSequenceComponent', () => {
  let component: AppSequenceComponent;
  let fixture: ComponentFixture<AppSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSequenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
