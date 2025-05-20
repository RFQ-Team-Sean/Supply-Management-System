import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { z } from 'zod';
import { UserService, User } from './user.service';

export const approvalSequenceSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters"),
  name: z.string().min(1, "Name is required"),
  level: z.number().min(1, "Level must be at least 1"),
  departmentCode: z.string().min(1, "Department code is required"),
  departmentName: z.string().min(1, "Department name is required"),
  roleCode: z.string().min(1, "Role code is required"),
  roleName: z.string().min(1, "Role name is required"),
  userId: z.string().min(1, "User ID is required"),
  userFullName: z.string().min(1, "User full name is required"),
  type: z.enum(['procurement', 'supply']),
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ApprovalSequence = z.infer<typeof approvalSequenceSchema>;

@Injectable({
  providedIn: 'root',
})
export class ApprovalSequenceService {
  private sequences: ApprovalSequence[] = [];
  private readonly SEQUENCES_STORAGE_KEY = 'approval_sequences_data';

  constructor(private userService: UserService) {
    this.loadSequences();
    this.initializeDefaultSequences();
  }

  // Load sequences from localStorage
  private loadSequences(): void {
    const storedSequences = localStorage.getItem(this.SEQUENCES_STORAGE_KEY);
    if (storedSequences) {
      const parsedSequences = JSON.parse(storedSequences);
      this.sequences = parsedSequences.map((seq: any) => ({
        ...seq,
        createdAt: seq.createdAt ? new Date(seq.createdAt) : new Date(),
        updatedAt: seq.updatedAt ? new Date(seq.updatedAt) : new Date(),
      }));
    }
  }

  // Save sequences to localStorage
  private saveSequences(): void {
    localStorage.setItem(this.SEQUENCES_STORAGE_KEY, JSON.stringify(this.sequences));
  }

  // Generate a random 32-character ID
  private generateId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  // Initialize default sequences if none exist
  private initializeDefaultSequences(): void {
    if (this.sequences.length === 0) {
      const procurementSequences: Omit<ApprovalSequence, 'createdAt' | 'updatedAt'>[] = [
        {
          id: '111',
          name: 'Budget Unit Review',
          level: 1,
          departmentCode: 'BUDGET',
          departmentName: 'Budget Unit',
          roleCode: 'accounting',
          roleName: 'Budget Officer',
          userId: '1',
          userFullName: 'John Doe',
          type: 'procurement',
          isActive: true,
        },
        {
          id: '222',
          name: 'Technical Specification Review',
          level: 2,
          departmentCode: 'INSPECTION',
          departmentName: 'Inspection Team',
          roleCode: 'inspection',
          roleName: 'Inspection Officer',
          userId: '5',
          userFullName: 'Charlie White',
          type: 'procurement',
          isActive: true,
        },
        {
          id: '333',
          name: 'College President Approval',
          level: 3,
          departmentCode: 'ADMIN',
          departmentName: 'Administration',
          roleCode: 'president',
          roleName: 'College President',
          userId: '15',
          userFullName: 'Dr. Kenneth James Belga',
          type: 'procurement',
          isActive: true,
        },
        {
          id: '444',
          name: 'BAC Final Review',
          level: 4,
          departmentCode: 'BAC',
          departmentName: 'Bids and Awards Committee',
          roleCode: 'bac',
          roleName: 'BAC Chairman',
          userId: '4',
          userFullName: 'Bob Brown',
          type: 'procurement',
          isActive: true,
        },
      ];

      const supplySequences: Omit<ApprovalSequence, 'createdAt' | 'updatedAt'>[] = [
        {
          id: '555',
          name: 'Delivery Inspection',
          level: 5,
          departmentCode: 'INSPECTION',
          departmentName: 'Inspection Team',
          roleCode: 'inspection',
          roleName: 'Inspection Officer',
          userId: '5',
          userFullName: 'Charlie White',
          type: 'supply',
          isActive: true,
        },
        {
          id: '666',
          name: 'RIS Review',
          level: 6,
          departmentCode: 'ACCOUNTING',
          departmentName: 'Accounting Unit',
          roleCode: 'accounting',
          roleName: 'CAF Officer',
          userId: '1',
          userFullName: 'John Doe',
          type: 'supply',
          isActive: true,
        },
        {
          id: '777',
          name: 'Receipt and Acknowledgement',
          level: 7,
          departmentCode: 'END_USER',
          departmentName: 'End User Department',
          roleCode: 'enduser',
          roleName: 'End User',
          userId: '6',
          userFullName: 'Diana Green',
          type: 'supply',
          isActive: true,
        },
        {
          id: '888',
          name: 'Final Document Verification',
          level: 8,
          departmentCode: 'ACCOUNTING',
          departmentName: 'Accounting Unit',
          roleCode: 'accounting',
          roleName: 'Accounting Officer',
          userId: '1',
          userFullName: 'John Doe',
          type: 'supply',
          isActive: true,
        },
        {
          id: '999',
          name: 'Property Inspection',
          level: 9,
          departmentCode: 'INSPECTION',
          departmentName: 'Inspection Team',
          roleCode: 'inspection',
          roleName: 'Property Inspector',
          userId: '5',
          userFullName: 'Charlie White',
          type: 'supply',
          isActive: true,
        },
        {
          id: '101010',
          name: 'Disposal Review',
          level: 10,
          departmentCode: 'SUPPLY',
          departmentName: 'Supply Management Unit',
          roleCode: 'supply',
          roleName: 'Supply Officer',
          userId: '3',
          userFullName: 'Alice Johnson',
          type: 'supply',
          isActive: true,
        },
      ];

      [...procurementSequences, ...supplySequences].forEach((sequence) => {
        this.addSequence(sequence).subscribe();
      });
    }
  }

  // Get all sequences
  getAllSequences(): Observable<ApprovalSequence[]> {
    return of(this.sequences);
  }

  // Get sequences by type (procurement or supply)
  getSequencesByType(type: 'procurement' | 'supply'): Observable<ApprovalSequence[]> {
    return of(this.sequences.filter((seq) => seq.type === type));
  }

  // Get a sequence by ID
  getSequenceById(sequenceId: string): Observable<ApprovalSequence | undefined> {
    const sequence = this.sequences.find((seq) => seq.id === sequenceId);
    return of(sequence);
  }

  // Create a new sequence
  addSequence(sequenceData: Omit<ApprovalSequence, 'id' | 'createdAt' | 'updatedAt'>): Observable<ApprovalSequence> {
    try {
      const newSequence: ApprovalSequence = {
        ...sequenceData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      approvalSequenceSchema.parse(newSequence);
      this.sequences.push(newSequence);
      this.saveSequences();

      return of(newSequence);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Update an existing sequence
  updateSequence(sequenceId: string, sequenceData: Partial<ApprovalSequence>): Observable<ApprovalSequence> {
    try {
      const sequenceIndex = this.sequences.findIndex((seq) => seq.id === sequenceId);
      if (sequenceIndex === -1) {
        return throwError(() => new Error('Sequence not found'));
      }

      const updatedSequence: ApprovalSequence = {
        ...this.sequences[sequenceIndex],
        ...sequenceData,
        id: sequenceId,
        updatedAt: new Date(),
      };

      approvalSequenceSchema.parse(updatedSequence);
      this.sequences[sequenceIndex] = updatedSequence;
      this.saveSequences();

      return of(updatedSequence);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Delete a sequence
  deleteSequence(sequenceId: string): Observable<boolean> {
    const sequenceIndex = this.sequences.findIndex((seq) => seq.id === sequenceId);
    if (sequenceIndex === -1) {
      return throwError(() => new Error('Sequence not found'));
    }

    this.sequences.splice(sequenceIndex, 1);
    this.saveSequences();

    return of(true);
  }

  // Get available users for approver selection based on role
  getAvailableUsers(role: string): Observable<User[]> {
    return new Observable((subscriber) => {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          const availableUsers = users.filter((user) => user.role === role.toLowerCase());
          subscriber.next(availableUsers);
          subscriber.complete();
        },
        error: (error) => subscriber.error(error),
      });
    });
  }

  // Reset sequences (for testing)
  resetSequences(): Observable<boolean> {
    this.sequences = [];
    this.saveSequences();
    return of(true);
  }

  // Update multiple sequences
  updateSequences(sequences: ApprovalSequence[]): Observable<boolean> {
    try {
      sequences.forEach((seq) => {
        const index = this.sequences.findIndex((s) => s.id === seq.id);
        if (index !== -1) {
          this.sequences[index] = seq;
        }
      });
      this.saveSequences();
      return of(true);
    } catch (error) {
      return throwError(() => error);
    }
  }
}