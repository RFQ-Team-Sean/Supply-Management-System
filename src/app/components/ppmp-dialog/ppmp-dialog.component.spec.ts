import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmpDialogComponent } from './ppmp-dialog.component';

describe('PpmpDialogComponent', () => {
  let component: PpmpDialogComponent;
  let fixture: ComponentFixture<PpmpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpmpDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpmpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
