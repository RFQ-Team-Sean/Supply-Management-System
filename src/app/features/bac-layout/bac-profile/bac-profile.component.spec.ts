import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacProfileComponent } from './bac-profile.component';

describe('BacProfileComponent', () => {
  let component: BacProfileComponent;
  let fixture: ComponentFixture<BacProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BacProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
