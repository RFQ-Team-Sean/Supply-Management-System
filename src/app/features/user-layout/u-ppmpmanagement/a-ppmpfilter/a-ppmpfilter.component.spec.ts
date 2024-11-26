import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APpmpfilterComponent } from './a-ppmpfilter.component';

describe('APpmpfilterComponent', () => {
  let component: APpmpfilterComponent;
  let fixture: ComponentFixture<APpmpfilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [APpmpfilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(APpmpfilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
