import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APerchaserequestComponent } from './a-purchaserequest.component';

describe('APerchaserequestComponent', () => {
  let component: APerchaserequestComponent;
  let fixture: ComponentFixture<APerchaserequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [APerchaserequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(APerchaserequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
