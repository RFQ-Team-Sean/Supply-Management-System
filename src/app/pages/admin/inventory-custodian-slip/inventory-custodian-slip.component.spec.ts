import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryCustodianSlipComponent } from './inventory-custodian-slip.component';

describe('InventoryCustodianSlipComponent', () => {
  let component: InventoryCustodianSlipComponent;
  let fixture: ComponentFixture<InventoryCustodianSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryCustodianSlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryCustodianSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
