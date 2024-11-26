import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoViewdetailsComponent } from './gso-viewdetails.component';

describe('GsoViewdetailsComponent', () => {
  let component: GsoViewdetailsComponent;
  let fixture: ComponentFixture<GsoViewdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoViewdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoViewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
