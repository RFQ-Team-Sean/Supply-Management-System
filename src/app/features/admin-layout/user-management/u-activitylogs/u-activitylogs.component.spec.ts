import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UActivitylogsComponent } from './u-activitylogs.component';

describe('UActivitylogsComponent', () => {
  let component: UActivitylogsComponent;
  let fixture: ComponentFixture<UActivitylogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UActivitylogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UActivitylogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
