// src/app/services/end-user-list.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { z } from 'zod';
import { UserService } from './user.service'; // Import UserService

// Zod schema for an End-User record referencing a user and an office
export const endUserRecordSchema = z.object({
  id: z.string().length(32).optional(),
  userId: z.string().length(32, "User ID must be 32 chars"),
  officeId: z.string().length(32, "Office ID must be 32 chars")
});

export type EndUserRecord = z.infer<typeof endUserRecordSchema>;

@Injectable({
  providedIn: 'root'
})
export class EndUserListService {
  private readonly STORAGE_KEY = 'end_user_records';

  private recordsSubject = new BehaviorSubject<EndUserRecord[]>([]);
  records$ = this.recordsSubject.asObservable();

  constructor(private userService: UserService) { // Inject UserService
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed: EndUserRecord[] = JSON.parse(stored);
        this.recordsSubject.next(parsed);
      } catch (error) {
        console.error('Error parsing end-user list data:', error);
      }
    }
    // Save to localStorage when changes occur
    this.records$.subscribe(list => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    });
  }

  getAllRecords(): EndUserRecord[] {
    return this.recordsSubject.value;
  }

  addRecord(data: Omit<EndUserRecord, 'id'>): EndUserRecord {
    const newRec: EndUserRecord = {
      ...data,
      id: this.generate32CharId()
    };
    endUserRecordSchema.parse(newRec); // validate
    const current = this.recordsSubject.value;
    this.recordsSubject.next([...current, newRec]);
    return newRec;
  }

  updateRecord(recordId: string, data: Partial<EndUserRecord>): EndUserRecord {
    const list = this.recordsSubject.value;
    const index = list.findIndex(r => r.id === recordId);
    if (index === -1) {
      throw new Error('End-user record not found');
    }

    const updated: EndUserRecord = {
      ...list[index],
      ...data
    };
    endUserRecordSchema.parse(updated);
    list[index] = updated;
    this.recordsSubject.next([...list]);
    return updated;
  }

  deleteRecord(recordId: string): void {
    const updated = this.recordsSubject.value.filter(r => r.id !== recordId);
    this.recordsSubject.next(updated);
  }

  // Fetch end users from UserService
  getEndUsers() {
    return this.userService.getAllUsers().pipe(
      map((users: any[]) => users.filter(user => user.role === 'end-user'))
    );
  }

  private generate32CharId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}