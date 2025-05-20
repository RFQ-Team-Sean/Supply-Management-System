import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmpDocsComponent } from './ppmp-docs.component';

describe('PpmpDocsComponent', () => {
  let component: PpmpDocsComponent;
  let fixture: ComponentFixture<PpmpDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpmpDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpmpDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
