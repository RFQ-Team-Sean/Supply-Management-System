import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedAssetReceivingComponent } from './fixed-asset-receiving.component';

describe('FixedAssetReceivingComponent', () => {
  let component: FixedAssetReceivingComponent;
  let fixture: ComponentFixture<FixedAssetReceivingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedAssetReceivingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedAssetReceivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
