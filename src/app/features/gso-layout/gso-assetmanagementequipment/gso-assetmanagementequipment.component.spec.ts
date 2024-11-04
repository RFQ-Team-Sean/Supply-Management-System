import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoAssetmanagementequipmentComponent } from './gso-assetmanagementequipment.component';

describe('GsoAssetmanagementequipmentComponent', () => {
  let component: GsoAssetmanagementequipmentComponent;
  let fixture: ComponentFixture<GsoAssetmanagementequipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoAssetmanagementequipmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoAssetmanagementequipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
