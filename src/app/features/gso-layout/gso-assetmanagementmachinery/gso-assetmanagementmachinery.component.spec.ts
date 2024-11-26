import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoAssetmanagementmachineryComponent } from './gso-assetmanagementmachinery.component';

describe('GsoAssetmanagementmachineryComponent', () => {
  let component: GsoAssetmanagementmachineryComponent;
  let fixture: ComponentFixture<GsoAssetmanagementmachineryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoAssetmanagementmachineryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoAssetmanagementmachineryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
