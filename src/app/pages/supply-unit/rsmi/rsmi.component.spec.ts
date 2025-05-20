import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RsmiComponent } from './rsmi.component';

describe('RsmiComponent', () => {
  let component: RsmiComponent;
  let fixture: ComponentFixture<RsmiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RsmiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RsmiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
