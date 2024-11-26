import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoAssetmanagementlandComponent } from './gso-assetmanagementland.component';

describe('GsoAssetmanagementlandComponent', () => {
  let component: GsoAssetmanagementlandComponent;
  let fixture: ComponentFixture<GsoAssetmanagementlandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoAssetmanagementlandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoAssetmanagementlandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
