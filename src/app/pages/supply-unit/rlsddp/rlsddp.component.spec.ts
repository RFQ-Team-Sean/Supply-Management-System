import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RLSDDPComponent } from './rlsddp.component';

describe('RLSDDPComponent', () => {
  let component: RLSDDPComponent;
  let fixture: ComponentFixture<RLSDDPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RLSDDPComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RLSDDPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 