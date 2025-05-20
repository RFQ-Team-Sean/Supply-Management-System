import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialReceivingComponent } from './special-receiving.component';

describe('SpecialReceivingComponent', () => {
  let component: SpecialReceivingComponent;
  let fixture: ComponentFixture<SpecialReceivingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialReceivingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialReceivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
