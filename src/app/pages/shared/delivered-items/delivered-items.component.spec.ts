import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveredItemsComponent } from './delivered-items.component';

describe('DeliveredItemsComponent', () => {
  let component: DeliveredItemsComponent;
  let fixture: ComponentFixture<DeliveredItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveredItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveredItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
