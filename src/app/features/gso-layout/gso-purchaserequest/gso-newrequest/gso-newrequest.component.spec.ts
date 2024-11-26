import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoNewrequestComponent } from './gso-newrequest.component';

describe('GsoNewrequestComponent', () => {
  let component: GsoNewrequestComponent;
  let fixture: ComponentFixture<GsoNewrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoNewrequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoNewrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
