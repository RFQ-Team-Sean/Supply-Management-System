import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemiExpendableComponent } from './semi-expendable.component';

describe('SemiExpendableComponent', () => {
  let component: SemiExpendableComponent;
  let fixture: ComponentFixture<SemiExpendableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemiExpendableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemiExpendableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
