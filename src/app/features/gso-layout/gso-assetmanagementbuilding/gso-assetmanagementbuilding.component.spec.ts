import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoAssetmanagementbuildingComponent } from './gso-assetmanagementbuilding.component';

describe('GsoAssetmanagementbuildingComponent', () => {
  let component: GsoAssetmanagementbuildingComponent;
  let fixture: ComponentFixture<GsoAssetmanagementbuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoAssetmanagementbuildingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoAssetmanagementbuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
