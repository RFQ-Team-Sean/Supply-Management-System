import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiTableComponent } from './multi-table.component';

describe('MultiTableComponent', () => {
  let component: MultiTableComponent;
  let fixture: ComponentFixture<MultiTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
