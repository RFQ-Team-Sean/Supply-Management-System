import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacDashboardComponent } from './bac-dashboard.component';

describe('BacDashboardComponent', () => {
  let component: BacDashboardComponent;
  let fixture: ComponentFixture<BacDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BacDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
