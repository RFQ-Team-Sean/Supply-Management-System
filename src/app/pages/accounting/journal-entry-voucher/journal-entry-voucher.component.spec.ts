import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalEntryVoucherComponent } from './journal-entry-voucher.component';

describe('JournalEntryVoucherComponent', () => {
  let component: JournalEntryVoucherComponent;
  let fixture: ComponentFixture<JournalEntryVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalEntryVoucherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JournalEntryVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
