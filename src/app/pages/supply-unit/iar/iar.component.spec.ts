import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IarComponent } from './iar.component';

describe('IarComponent', () => {
  let component: IarComponent;
  let fixture: ComponentFixture<IarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 