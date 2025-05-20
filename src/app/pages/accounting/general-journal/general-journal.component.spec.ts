import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralJournalComponent } from './general-journal.component';

describe('GeneralJournalComponent', () => {
  let component: GeneralJournalComponent;
  let fixture: ComponentFixture<GeneralJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralJournalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneralJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
