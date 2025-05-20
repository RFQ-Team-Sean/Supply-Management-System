import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmpTemplateComponent } from './ppmp-template.component';

describe('PpmpTemplateComponent', () => {
  let component: PpmpTemplateComponent;
  let fixture: ComponentFixture<PpmpTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpmpTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpmpTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
