import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisAccountingComponent } from './ris-accounting.component';

describe('RisAccountingComponent', () => {
  let component: RisAccountingComponent;
  let fixture: ComponentFixture<RisAccountingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisAccountingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RisAccountingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
