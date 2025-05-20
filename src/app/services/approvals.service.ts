// src/app/services/approvals.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: ApprovalStatus;
  dateCreated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApprovalsService {

  private readonly APPROVALS_KEY = 'approvals_data';

  private approvalsSubject = new BehaviorSubject<Approval[]>([]);
  approvals$ = this.approvalsSubject.asObservable();

  constructor() {
    // 1) Load from localStorage if available
    const stored = localStorage.getItem(this.APPROVALS_KEY);
    if (stored) {
      try {
        const parsed: Approval[] = JSON.parse(stored);
        // Convert date strings back to Date
        for (const ap of parsed) {
          if (typeof ap.dateCreated === 'string') {
            ap.dateCreated = new Date(ap.dateCreated);
          }
        }
        this.approvalsSubject.next(parsed);
      } catch (error) {
        console.error('Error parsing approvals data', error);
      }
    }

    // 2) Whenever the array changes, save to localStorage
    this.approvals$.subscribe(list => {
      localStorage.setItem(this.APPROVALS_KEY, JSON.stringify(list));
    });
  }

  /** Create a new approval request with status 'pending' */
  createApproval(data: Omit<Approval, 'id' | 'status' | 'dateCreated'>): Approval {
    const newAp: Approval = {
      ...data,
      id: this.generateId(),
      status: 'pending',
      dateCreated: new Date()
    };
    const currentList = this.approvalsSubject.value;
    this.approvalsSubject.next([...currentList, newAp]);
    return newAp;
  }

  /** Update status of an approval by ID */
  updateApprovalStatus(approvalId: string, newStatus: ApprovalStatus) {
    const list = this.approvalsSubject.value;
    const index = list.findIndex(a => a.id === approvalId);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        status: newStatus
      };
      this.approvalsSubject.next([...list]);
    }
  }

  getAllApprovals(): Approval[] {
    return this.approvalsSubject.value;
  }

  private generateId(): string {
    // 8-char hex ID
    return Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}
