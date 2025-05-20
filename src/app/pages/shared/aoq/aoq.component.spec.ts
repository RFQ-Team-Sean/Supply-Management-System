import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AoqComponent } from './aoq.component';

describe('AoqComponent', () => {
  let component: AoqComponent;
  let fixture: ComponentFixture<AoqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AoqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AoqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
