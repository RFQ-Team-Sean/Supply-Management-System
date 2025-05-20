import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliesIssuanceComponent } from './supplies-issuance.component';

describe('SuppliesIssuanceComponent', () => {
  let component: SuppliesIssuanceComponent;
  let fixture: ComponentFixture<SuppliesIssuanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliesIssuanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliesIssuanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
