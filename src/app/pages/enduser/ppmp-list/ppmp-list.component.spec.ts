import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmpListComponent } from './ppmp-list.component';

describe('PpmpListComponent', () => {
  let component: PpmpListComponent;
  let fixture: ComponentFixture<PpmpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpmpListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpmpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
