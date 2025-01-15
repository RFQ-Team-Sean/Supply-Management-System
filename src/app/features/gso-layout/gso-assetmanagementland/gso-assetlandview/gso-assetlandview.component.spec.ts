import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoAssetlandviewComponent } from './gso-assetlandview.component';

describe('GsoAssetlandviewComponent', () => {
  let component: GsoAssetlandviewComponent;
  let fixture: ComponentFixture<GsoAssetlandviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoAssetlandviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoAssetlandviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
