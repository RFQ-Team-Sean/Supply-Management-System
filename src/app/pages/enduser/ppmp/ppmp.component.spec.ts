import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmpComponent } from './ppmp.component';

describe('PpmpComponent', () => {
  let component: PpmpComponent;
  let fixture: ComponentFixture<PpmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpmpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
