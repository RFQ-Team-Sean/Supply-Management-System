import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoSuppliermanagementComponent } from './gso-suppliermanagement.component';

describe('GsoSuppliermanagementComponent', () => {
  let component: GsoSuppliermanagementComponent;
  let fixture: ComponentFixture<GsoSuppliermanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoSuppliermanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoSuppliermanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
