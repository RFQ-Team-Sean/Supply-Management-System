import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASystemsettings } from './a-systemsettings.component';

describe('ASystemsettings', () => {
  let component: ASystemsettings;
  let fixture: ComponentFixture<ASystemsettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASystemsettings]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ASystemsettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
