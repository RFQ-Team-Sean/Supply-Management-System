import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoAssetlandeditComponent } from './gso-assetlandedit.component';

describe('GsoAssetlandeditComponent', () => {
  let component: GsoAssetlandeditComponent;
  let fixture: ComponentFixture<GsoAssetlandeditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoAssetlandeditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoAssetlandeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
