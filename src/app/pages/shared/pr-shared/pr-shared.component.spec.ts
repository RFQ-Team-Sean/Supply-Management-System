import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrSharedComponent } from './pr-shared.component';

describe('PrSharedComponent', () => {
  let component: PrSharedComponent;
  let fixture: ComponentFixture<PrSharedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrSharedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
