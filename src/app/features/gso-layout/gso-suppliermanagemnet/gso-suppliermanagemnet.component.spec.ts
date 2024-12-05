import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoSuppliermanagemnetComponent } from './gso-suppliermanagemnet.component';

describe('GsoSuppliermanagemnetComponent', () => {
  let component: GsoSuppliermanagemnetComponent;
  let fixture: ComponentFixture<GsoSuppliermanagemnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoSuppliermanagemnetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoSuppliermanagemnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
