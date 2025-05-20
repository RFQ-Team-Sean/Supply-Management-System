import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RpciComponent } from './rpci.component';

describe('RpciComponent', () => {
  let component: RpciComponent;
  let fixture: ComponentFixture<RpciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RpciComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RpciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 