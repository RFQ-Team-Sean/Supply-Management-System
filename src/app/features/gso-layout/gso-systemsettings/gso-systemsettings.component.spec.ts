import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsoSystemsettingsComponent } from './gso-systemsettings.component';

describe('GsoSystemsettingsComponent', () => {
  let component: GsoSystemsettingsComponent;
  let fixture: ComponentFixture<GsoSystemsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsoSystemsettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GsoSystemsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
