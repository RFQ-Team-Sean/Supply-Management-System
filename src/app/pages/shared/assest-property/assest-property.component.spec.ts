import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssestPropertyComponent } from './assest-property.component';

describe('AssestPropertyComponent', () => {
  let component: AssestPropertyComponent;
  let fixture: ComponentFixture<AssestPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssestPropertyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssestPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
