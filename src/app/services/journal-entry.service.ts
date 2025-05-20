import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DeliveryReceipt } from './delivery-receipt.service';

export interface JournalEntryAccount {
  accountType: 'debit' | 'credit';
  accountCode: string;
  amount: number;
}

export interface JournalEntry {
  id: string;
  receiptNumber: string;
  date: Date;
  description: string;
  entries: JournalEntryAccount[];
  debitTotal: number;
  creditTotal: number;
  supplierName: string;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class JournalEntryService {
  private journalEntries = new BehaviorSubject<JournalEntry[]>([]);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      const entries = JSON.parse(storedEntries);
      // Convert string dates back to Date objects
      entries.forEach((entry: JournalEntry) => {
        entry.date = new Date(entry.date);
      });
      this.journalEntries.next(entries);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('journalEntries', JSON.stringify(this.journalEntries.value));
  }

  getAll() {
    return this.journalEntries.asObservable();
  }

  addEntry(receipt: DeliveryReceipt, entries: JournalEntryAccount[]) {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      receiptNumber: receipt.receipt_number,
      date: new Date(),
      description: `Journal entry for receipt ${receipt.receipt_number}`,
      entries: entries,
      debitTotal: entries.reduce((sum, entry) => 
        entry.accountType === 'debit' ? sum + entry.amount : sum, 0),
      creditTotal: entries.reduce((sum, entry) => 
        entry.accountType === 'credit' ? sum + entry.amount : sum, 0),
      supplierName: receipt.supplier_name,
      totalAmount: receipt.total_amount
    };

    const currentEntries = this.journalEntries.value;
    this.journalEntries.next([...currentEntries, newEntry]);
    this.saveToLocalStorage();
    
    return newEntry;
  }

  getEntryByReceiptNumber(receiptNumber: string) {
    return this.journalEntries.value.find(entry => entry.receiptNumber === receiptNumber);
  }

  deleteEntry(id: string) {
    const currentEntries = this.journalEntries.value;
    this.journalEntries.next(currentEntries.filter(entry => entry.id !== id));
    this.saveToLocalStorage();
  }
}