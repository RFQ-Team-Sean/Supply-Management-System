import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoAssetmanagementvechilesComponent } from './gso-assetmanagementvechiles.component';

describe('GsoAssetmanagementvechilesComponent', () => {
  let component: GsoAssetmanagementvechilesComponent;
  let fixture: ComponentFixture<GsoAssetmanagementvechilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoAssetmanagementvechilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoAssetmanagementvechilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
