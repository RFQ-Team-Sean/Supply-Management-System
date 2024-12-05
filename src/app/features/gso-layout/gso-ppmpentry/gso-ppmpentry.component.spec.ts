import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoPpmpentryComponent } from './gso-ppmpentry.component';

describe('GsoPpmpentryComponent', () => {
  let component: GsoPpmpentryComponent;
  let fixture: ComponentFixture<GsoPpmpentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoPpmpentryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoPpmpentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
