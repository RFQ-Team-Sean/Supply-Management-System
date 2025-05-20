import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningOfBidsComponent } from './opening-of-bids.component';

describe('OpeningOfBidsComponent', () => {
  let component: OpeningOfBidsComponent;
  let fixture: ComponentFixture<OpeningOfBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpeningOfBidsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpeningOfBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
