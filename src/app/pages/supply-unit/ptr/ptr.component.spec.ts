import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PTRComponent } from './ptr.component';

describe('PTRComponent', () => {
  let component: PTRComponent;
  let fixture: ComponentFixture<PTRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PTRComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PTRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 