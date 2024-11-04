import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewsupplierComponent } from './gso-newsupplier.component';

describe('GsoNewsupplierComponent', () => {
  let component: GsoNewsupplierComponent;
  let fixture: ComponentFixture<GsoNewsupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewsupplierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewsupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
