import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AActivitylogsComponent } from './a-activitylogs.component';

describe('APerchaserequestComponent', () => {
  let component: AActivitylogsComponent;
  let fixture: ComponentFixture<AActivitylogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AActivitylogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AActivitylogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
