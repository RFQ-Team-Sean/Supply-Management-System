import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GeneralJournalEntry {
  entryNo: string;
  date: Date;
  description: string;
  debitTotal: number;
  creditTotal: number;
  transactions: JournalTransaction[];
}

export interface JournalTransaction {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface LedgerAccount {
  accountCode: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  transactions: LedgerTransaction[];
}

export interface LedgerTransaction {
  date: Date;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface JournalVoucherEntry {
  accountCode: string;
  accountName: string;
  amount: number;
}

interface JournalVoucher {
  voucherNo: string;
  totalAmountDue: number;
  debitEntries: JournalVoucherEntry[];
  creditEntries: JournalVoucherEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private readonly JOURNAL_ENTRIES_KEY = 'journal_entries';
  private readonly LEDGER_ACCOUNTS_KEY = 'ledger_accounts';
  private readonly PROCESSED_VOUCHERS_KEY = 'processed_vouchers';

  private journalEntries = new BehaviorSubject<GeneralJournalEntry[]>([]);
  private ledgerAccounts = new BehaviorSubject<LedgerAccount[]>([]);
  private processedVouchers = new Set<string>();

  constructor() {
    this.loadSavedData();
  }

  private loadSavedData() {
    try {
      // Load journal entries
      const savedJournalEntries = localStorage.getItem(this.JOURNAL_ENTRIES_KEY);
      if (savedJournalEntries) {
        const entries = JSON.parse(savedJournalEntries);
        entries.forEach((entry: GeneralJournalEntry) => {
          entry.date = new Date(entry.date);
          entry.transactions.forEach((t: any) => {
            if (t.date) t.date = new Date(t.date);
          });
        });
        this.journalEntries.next(entries);
      }

      // Load ledger accounts
      const savedLedgerAccounts = localStorage.getItem(this.LEDGER_ACCOUNTS_KEY);
      if (savedLedgerAccounts) {
        const accounts = JSON.parse(savedLedgerAccounts);
        accounts.forEach((account: LedgerAccount) => {
          account.transactions.forEach(t => {
            t.date = new Date(t.date);
          });
        });
        this.ledgerAccounts.next(accounts);
      }

      // Load processed vouchers
      const savedProcessedVouchers = localStorage.getItem(this.PROCESSED_VOUCHERS_KEY);
      if (savedProcessedVouchers) {
        const vouchers = JSON.parse(savedProcessedVouchers);
        this.processedVouchers = new Set(vouchers);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      // If there's an error loading saved data, initialize with empty states
      this.journalEntries.next([]);
      this.ledgerAccounts.next([]);
      this.processedVouchers = new Set<string>();
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(this.JOURNAL_ENTRIES_KEY, JSON.stringify(this.journalEntries.value));
      localStorage.setItem(this.LEDGER_ACCOUNTS_KEY, JSON.stringify(this.ledgerAccounts.value));
      localStorage.setItem(this.PROCESSED_VOUCHERS_KEY, JSON.stringify([...this.processedVouchers]));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  getJournalEntries() {
    return this.journalEntries.asObservable();
  }

  getLedgerAccounts() {
    return this.ledgerAccounts.asObservable();
  }

  isVoucherProcessed(voucherNo: string): boolean {
    return this.processedVouchers.has(voucherNo);
  }

  generateAccountingEntries(journalVoucher: JournalVoucher) {
    try {
      // Check if voucher has already been processed
      if (this.isVoucherProcessed(journalVoucher.voucherNo)) {
        throw new Error('This voucher has already been processed');
      }

      // First create the journal entry
      const journalEntry: GeneralJournalEntry = {
        entryNo: `JE-${Date.now()}`,
        date: new Date(),
        description: `Journal entry for voucher ${journalVoucher.voucherNo}`,
        debitTotal: journalVoucher.totalAmountDue,
        creditTotal: journalVoucher.totalAmountDue,
        transactions: [
          ...journalVoucher.debitEntries.map((entry: JournalVoucherEntry) => ({
            accountCode: entry.accountCode,
            accountName: entry.accountName,
            debit: entry.amount,
            credit: 0
          })),
          ...journalVoucher.creditEntries.map((entry: JournalVoucherEntry) => ({
            accountCode: entry.accountCode,
            accountName: entry.accountName,
            debit: 0,
            credit: entry.amount
          }))
        ]
      };

      // Update journal entries
      const currentJournalEntries = this.journalEntries.value;
      this.journalEntries.next([...currentJournalEntries, journalEntry]);

      // Update ledger accounts
      const currentLedgerAccounts = this.ledgerAccounts.value;
      const updatedLedgerAccounts = [...currentLedgerAccounts];

      // Process each transaction
      journalEntry.transactions.forEach(transaction => {
        const existingAccount = updatedLedgerAccounts.find(a => a.accountCode === transaction.accountCode);
        
        if (existingAccount) {
          // Update existing account
          existingAccount.debitTotal += transaction.debit;
          existingAccount.creditTotal += transaction.credit;
          existingAccount.balance = existingAccount.debitTotal - existingAccount.creditTotal;
          
          // Add new transaction
          existingAccount.transactions.push({
            date: journalEntry.date,
            description: journalEntry.description,
            debit: transaction.debit,
            credit: transaction.credit,
            balance: existingAccount.balance
          });
        } else {
          // Create new account
          const newAccount: LedgerAccount = {
            accountCode: transaction.accountCode,
            accountName: transaction.accountName,
            debitTotal: transaction.debit,
            creditTotal: transaction.credit,
            balance: transaction.debit - transaction.credit,
            transactions: [{
              date: journalEntry.date,
              description: journalEntry.description,
              debit: transaction.debit,
              credit: transaction.credit,
              balance: transaction.debit - transaction.credit
            }]
          };
          updatedLedgerAccounts.push(newAccount);
        }
      });

      // Update ledger accounts
      this.ledgerAccounts.next(updatedLedgerAccounts);

      // Mark voucher as processed
      this.processedVouchers.add(journalVoucher.voucherNo);

      // Save all changes to localStorage
      this.saveToLocalStorage();
      
      return true;
    } catch (error) {
      console.error('Error generating accounting entries:', error);
      throw error;
    }
  }

  clearAll() {
    this.journalEntries.next([]);
    this.ledgerAccounts.next([]);
    this.processedVouchers.clear();
    localStorage.removeItem(this.JOURNAL_ENTRIES_KEY);
    localStorage.removeItem(this.LEDGER_ACCOUNTS_KEY);
    localStorage.removeItem(this.PROCESSED_VOUCHERS_KEY);
  }

  // Optional: Add method to remove a specific voucher from processed list
  removeProcessedVoucher(voucherNo: string) {
    this.processedVouchers.delete(voucherNo);
    this.saveToLocalStorage();
  }
}