import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoInventoryeditComponent } from './gso-inventoryedit.component';

describe('GsoInventoryeditComponent', () => {
  let component: GsoInventoryeditComponent;
  let fixture: ComponentFixture<GsoInventoryeditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoInventoryeditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoInventoryeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
