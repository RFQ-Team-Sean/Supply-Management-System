import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DCreateppmpComponent } from './d-createppmp.component';

describe('DCreateppmpComponent', () => {
  let component: DCreateppmpComponent;
  let fixture: ComponentFixture<DCreateppmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DCreateppmpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DCreateppmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
