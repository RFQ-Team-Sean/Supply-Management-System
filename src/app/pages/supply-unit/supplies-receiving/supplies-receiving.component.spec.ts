import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliesReceivingComponent } from './supplies-receiving.component';

describe('SuppliesReceivingComponent', () => {
  let component: SuppliesReceivingComponent;
  let fixture: ComponentFixture<SuppliesReceivingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliesReceivingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliesReceivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
